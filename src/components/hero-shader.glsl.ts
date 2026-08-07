/**
 * GLSL for the hero field. Kept out of the component so the runtime beside it
 * stays readable as plumbing (buffers, framebuffers, resize, teardown) and the
 * picture lives in one place.
 *
 * Two passes, both drawn as a single full-screen triangle pair:
 *
 *   FLOW       an offscreen ping-pong buffer holding the pointer's wake. It is
 *              advected by its own velocity and rolled by curl noise, so a
 *              stroke keeps moving after the pointer has stopped instead of
 *              sitting there as a stamped shape.
 *   COMPOSITE  the visible frame. Domain-warped noise gives the marbling, a
 *              ridged pass gives the filaments running through it, and the flow
 *              buffer bends the sample point so the wake carves the marbling
 *              rather than being painted on top of it.
 *
 * Both are GLSL ES 1.00 (WebGL 1) on purpose. Nothing here needs WebGL 2, and
 * WebGL 1 is the one that is present everywhere, including the older iOS
 * devices that still make up a real share of phone traffic.
 */

/**
 * Shared by both passes. The quad is two triangles in clip space, so the
 * position doubles as the UV once it is mapped from -1..1 to 0..1.
 */
export const VERTEX_SHADER = /* glsl */ `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

/**
 * Precision and noise, textually shared by both fragment shaders.
 *
 * highp is requested rather than assumed. Simplex noise runs its lattice
 * through a permutation polynomial whose intermediate values pass 289 * 34, and
 * at mediump those wrap into visible blocky repeats. The guard is what keeps a
 * device without highp in the fragment stage rendering something rather than
 * failing to compile, and such devices are rare enough that the degraded look
 * is the right trade against carrying a second code path.
 */
const PRELUDE = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

// Ashima's 2D simplex noise, unmodified. Chosen over value noise because the
// gradients are isotropic: value noise leaves axis-aligned creases that read as
// a grid the moment you warp the domain, which is exactly what happens below.
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`

/**
 * Four octaves of plain fbm, returning roughly -1..1.
 *
 * The lacunarity is 2.03 rather than 2.0 and each octave carries an offset,
 * because at exactly double frequency with no offset the octaves share zero
 * crossings and pile up into a repeating diamond. The odd number decorrelates
 * them for free.
 */
const FBM = /* glsl */ `
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * snoise(p);
    p = p * 2.03 + 17.1;
    amp *= 0.5;
  }
  return sum;
}

// Ridged variant: folding the noise about zero turns the smooth crests into
// creases, and squaring sharpens them. This is where the filaments come from.
// Three octaves is enough because the fourth lands under the grain anyway.
float ridged(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    float n = 1.0 - abs(snoise(p));
    sum += amp * n * n;
    p = p * 2.11 + 9.7;
    amp *= 0.5;
  }
  return sum;
}
`

/**
 * Pass one. Reads the previous flow buffer, returns the next one.
 *
 * The buffer is RGBA8, not float: half-float render targets need two optional
 * extensions that a meaningful number of devices still refuse, and eight bits
 * is plenty for a field that is about to be blurred and used as an offset. The
 * one place the low precision bites is decay, which is handled at the bottom.
 *
 *   R    ink, 0..1
 *   GB   velocity, stored as v * 0.5 + 0.5 so it survives an unsigned texture
 */
export const FLOW_SHADER =
  PRELUDE +
  /* glsl */ `
uniform sampler2D uField;
uniform vec2 uTexel;        // 1 / buffer size, in pixels
uniform vec2 uPointer;      // uv, y already flipped for GL
uniform vec2 uPointerPrev;
uniform float uAmount;      // 0 when the pointer is still or absent
uniform float uAspect;
uniform float uTime;
uniform float uDecay;       // computed per frame from dt, see the runtime

// Curl of a drifting noise field. Taking the perpendicular of the gradient
// makes it divergence free, which is the whole point: a plain noise velocity
// has sources and sinks, so ink piles into blobs. Curl only rotates it, so the
// wake rolls and folds the way stirred ink does.
vec2 curl(vec2 p) {
  float e = 0.09;
  float n0 = snoise(p + vec2(0.0, e));
  float n1 = snoise(p - vec2(0.0, e));
  float n2 = snoise(p + vec2(e, 0.0));
  float n3 = snoise(p - vec2(e, 0.0));
  return vec2(n0 - n1, n3 - n2) / (2.0 * e);
}

// Distance to the segment the pointer travelled this frame, not to the pointer
// itself. A fast flick between two frames can cross a third of the box, and
// splatting at the endpoint alone leaves that as a dotted line.
float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec2 uv = vUv;
  vec4 here = texture2D(uField, uv);
  vec2 velocity = here.gb * 2.0 - 1.0;

  // Semi-Lagrangian advection: instead of pushing this texel somewhere, look
  // back along its own velocity and take whatever was there. Backwards is the
  // stable direction, and it needs one sample rather than a scatter.
  vec2 back = uv - velocity * uTexel * 3.2;
  vec4 carried = texture2D(uField, back);

  // Four-tap diffusion at the same point. Without it the wake stays a hard
  // edged stroke and never softens into something that looks wet.
  vec4 spread = (
      texture2D(uField, back + vec2( uTexel.x, 0.0))
    + texture2D(uField, back + vec2(-uTexel.x, 0.0))
    + texture2D(uField, back + vec2(0.0,  uTexel.y))
    + texture2D(uField, back + vec2(0.0, -uTexel.y))
  ) * 0.25;
  carried = mix(carried, spread, 0.26);

  float ink = carried.r;
  vec2 nextVelocity = carried.gb * 2.0 - 1.0;

  // Ambient stirring. Scaled small so it shapes the wake rather than driving
  // it, and drifting on uTime so an untouched buffer never settles.
  vec2 stir = curl(uv * vec2(uAspect, 1.0) * 2.4 + vec2(0.0, uTime * 0.03));
  nextVelocity = mix(nextVelocity, stir * 0.14, 0.09);

  // Inject. The Gaussian falloff keeps the edge of the stroke soft enough that
  // diffusion has something to work with.
  float d = segmentDistance(vUv * vec2(uAspect, 1.0),
                            uPointerPrev * vec2(uAspect, 1.0),
                            uPointer * vec2(uAspect, 1.0));
  float splat = exp(-(d * d) / 0.003);

  // Saturating rather than cumulative. Adding splat * amount outright drives
  // ink to 1.0 within a few frames anywhere the pointer lingers or doubles
  // back, and a field pinned at its ceiling carries no shape at all. Scaling
  // the addition by the room left means a stroke approaches full but the tone
  // inside it still varies.
  ink += splat * uAmount * (1.0 - ink);
  nextVelocity += (uPointer - uPointerPrev) * splat * uAmount * 9.0;

  // Decay. The subtraction is not cosmetic: at eight bits, 3/255 multiplied by
  // 0.98 rounds back to 3/255, so a pure multiply leaves permanent smudges
  // wherever the pointer has been. Taking a constant off as well guarantees
  // every texel reaches zero.
  ink = max(ink * uDecay - 0.004, 0.0);
  nextVelocity *= 0.985;

  gl_FragColor = vec4(min(ink, 1.0), clamp(nextVelocity * 0.5 + 0.5, 0.0, 1.0), 1.0);
}
`

/**
 * Pass two. The visible frame.
 *
 * Colour is mixed in linear light and converted to sRGB once at the end. The
 * palette arrives already linearised from the runtime, so the endpoints are
 * exactly the site's tokens while everything between them is a physically
 * sensible blend. Mixed in sRGB, a ramp from near-black forest to pale lime
 * goes grey through the middle, which is the muddy look this is avoiding.
 */
export const COMPOSITE_SHADER =
  PRELUDE +
  FBM +
  /* glsl */ `
uniform sampler2D uField;
uniform float uAspect;
uniform float uTime;
uniform float uGrain;

// The site's own tokens, linearised. See readPalette() in the runtime.
uniform vec3 uDeep;    // --forest-deep
uniform vec3 uForest;  // --forest
uniform vec3 uSignal;  // --signal
uniform vec3 uCream;   // --on-dark

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 uv = vUv;

  // Aspect corrected, so features stay round rather than stretching with the
  // box, and then scaled.
  //
  // 0.85 is the single most important number in this file. Anything much above
  // 1.5 and four octaves of fbm land at texture frequency, which reads as
  // lichen on a rock rather than as something moving. Kept low, the same maths
  // gives a handful of large masses that visibly travel.
  //
  // The sqrt term is what lets one shader serve both banners. Normalising
  // purely by height fixes the feature size to the short edge, so a 3.7:1
  // closing banner simply gets twice as many features across it as a 1.9:1
  // hero and reads as busy noise next to it. Easing the scale down as the box
  // widens splits the difference between normalising by height and by width:
  // the hero is left where it was, and wide boxes get proportionally larger
  // masses instead of more of them.
  float scale = 0.85 * sqrt(1.9 / max(uAspect, 0.5));
  vec2 p = (uv - 0.5) * vec2(uAspect, 1.0) * scale;

  vec4 field = texture2D(uField, uv);
  float ink = field.r;
  vec2 flow = field.gb * 2.0 - 1.0;

  float t = uTime;

  // Two clocks, and the difference between them is what makes this read as
  // footage rather than as a shader.
  //
  // The drift translates the whole field, so shapes cross the frame and leave
  // it. The smaller per-axis offsets below evolve the field in place. Motion
  // built only from the second kind boils: everything churns, nothing goes
  // anywhere, and a few seconds of it is obviously a loop that is not looping.
  vec2 drift = vec2(-t * 0.018, t * 0.007);
  vec2 pd = p + drift;

  // Domain warp. Two fbm fields drag the sample point sideways before the
  // structure is evaluated, which is what turns concentric noise blobs into
  // marbling. The two run at different rates and opposite signs so the pair
  // never returns to the same pose.
  vec2 warp = vec2(
    fbm(pd + vec2(0.0, t * 0.03)),
    fbm(pd + vec2(4.7, 1.9) - t * 0.024)
  );

  // The wake enters here rather than as an overlay, so the pointer displaces
  // the marbling itself. Same idea as the reference site's displacement map,
  // except the thing being displaced is generated rather than a video frame.
  //
  // 1.3 is a balance rather than a maximum. Higher, and the flow gradient
  // inside a stroke stretches the marbling so hard that it smears into a flat
  // wash, losing the structure the distortion is supposed to be revealing.
  vec2 q = pd + warp * 1.9 + flow * 1.3;

  float detail = fbm(q) * 0.5 + 0.5;

  // Broad masses, so the frame has a composition of lit and unlit regions
  // rather than one even field of texture. This reuses the warp instead of
  // evaluating another fbm, which costs nothing and has the better side effect
  // of putting the light where the flow already is.
  float macro = warp.x * 0.5 + 0.5;
  float body = mix(detail, macro, 0.55);

  // Sampled anisotropically: squashing x stretches every crease along that
  // axis, which is what turns the ridges from a field of hooks into lines that
  // travel across the frame.
  float veins = ridged(q * vec2(0.62, 1.05));

  // A broad mask so the filaments cluster instead of covering everything.
  // Without it the frame is evenly busy and reads as camouflage, and there is
  // nowhere quiet for the media sitting on top to be read against. warp.y is
  // reused for the same reason macro reuses warp.x: it is already computed and
  // it is already at the right scale.
  float clearing = smoothstep(0.28, 0.72, warp.y * 0.5 + 0.5);

  // Palette. Forest in both schemes, matching the .section-dark panels: the
  // hero is a dark surface the page sits against, not a surface that flips.
  //
  // The lift is a multiple of the forest rather than a mix toward the lime.
  // Scaling in linear light keeps the chromaticity exactly, so this is the
  // token under more light; mixing toward lime instead walks the hue through
  // olive, and olive is not in this palette.
  vec3 lifted = uForest * 2.9;

  // Every threshold below is set against the range these signals actually
  // occupy, which is nothing like 0..1. Measured over a frame:
  //
  //            p50    p90    p99    p99.9   max
  //   body     0.49   0.63   0.70   0.75    0.77
  //   veins    0.35   0.58   0.73   0.80    0.87
  //
  // fbm and ridged noise both cluster hard around their mean and effectively
  // never reach their theoretical bounds, so a ramp written to end at 1.0 ends
  // somewhere no pixel ever goes and the effect it controls simply never
  // appears. That is worth knowing before moving any of these numbers: the
  // useful range is roughly 0.3 to 0.8, and a difference of 0.05 is large.
  vec3 col = mix(uDeep, uForest, smoothstep(0.06, 0.68, body));
  col = mix(col, lifted, smoothstep(0.45, 0.72, body) * 0.9);

  // The signal is held to the filament cores, and only where the body is
  // already lit and inside a clearing. Gating on all three is what keeps it a
  // vein running through the frame instead of a green wash over half of it.
  // The veins ramp tops out near p99, so the lime lands on a few per cent of
  // the frame.
  float core = smoothstep(0.50, 0.74, veins) * smoothstep(0.32, 0.62, body) * clearing;
  col = mix(col, uSignal, core * 0.88);

  // Cream only at the very top of a filament, and kept low. Pushed further it
  // desaturates the lime into a sand colour, which loses the one hue on the
  // site at exactly the point it is most visible.
  col = mix(col, uCream, smoothstep(0.72, 0.86, veins) * core * 0.3);

  // The clearing doubles as the frame's composition: outside it the field is
  // held down, so there are dark places to rest and the media on top always has
  // somewhere quiet to sit.
  col *= mix(0.72, 1.0, clearing);

  // The wake is drawn as a rim, not a fill.
  //
  // Almost all of its effect has already happened: it displaced q above, so
  // the marbling bends around the stroke. What is left is only to make the
  // disturbance legible, and filling the stroke with colour is the wrong way
  // to do that. Ink runs high along the whole path, so any fill paints a wide
  // pale band over the frame and hides the very thing being disturbed.
  //
  // wake * (1 - wake) peaks halfway up instead, which puts the signal on the
  // boundary where the ink meets undisturbed field and leaves the middle
  // clear. That is also how a disturbance in water actually reads: an edge
  // that catches the light, with the centre sitting slightly darker.
  //
  // The cube is not optional. A soft brush plus diffusion leaves a broad
  // gradient, so a bare wake * (1 - wake) is near its peak across about a
  // tenth of the frame, which is a wide band and not a rim at all. Cubing
  // pulls it back to the narrow edge the name implies, and the weight can then
  // afford to be higher because far less of the frame is carrying it.
  float wake = clamp(ink * 1.2, 0.0, 1.0);
  float rim = pow(wake * (1.0 - wake) * 4.0, 3.0);
  col = mix(col, uSignal, rim * 0.4);
  col *= 1.0 - wake * 0.12;

  // A single broad highlight crossing the frame, so it reads as lit from
  // somewhere rather than uniformly bright.
  //
  // It scales the colour instead of mixing toward cream, and that is not a
  // detail. These are near-black greens, and in linear light even five per
  // cent of a near-white raises them to a mid grey once they are gamma
  // encoded, which fogs the entire frame. Multiplying leaves black black.
  float sheen = sin(p.x * 0.55 + p.y * 0.4 + warp.x * 2.2 + t * 0.1) * 0.5 + 0.5;
  col *= 1.0 + pow(sheen, 3.0) * 0.35;

  float vignette = 1.0 - smoothstep(0.55, 1.35, length((uv - 0.5) * vec2(uAspect, 1.0) * 2.0));
  col *= mix(0.78, 1.0, vignette);

  vec3 srgb = pow(max(col, 0.0), vec3(1.0 / 2.2));

  // Grain last, in display space. It is doing two jobs: eight-bit output across
  // a slow dark ramp bands badly and a dither hides it, and the texture keeps
  // the frame from looking like clean vector output.
  srgb += (hash12(gl_FragCoord.xy + fract(t) * 431.0) - 0.5) * uGrain;

  gl_FragColor = vec4(srgb, 1.0);
}
`
