'use client'

import { useEffect, useRef } from 'react'
import { COMPOSITE_SHADER, FLOW_SHADER, VERTEX_SHADER } from './hero-shader.glsl'

/**
 * Ceiling on the number of fragments the composite pass covers.
 *
 * The frame costs about a dozen simplex evaluations per pixel, so this is the
 * one number that decides whether the hero is free or is the most expensive
 * thing on the page. Rendering under the display and letting the browser scale
 * up costs nothing here because the picture is entirely soft: there is no text
 * or hard edge in it for the upscale to blur. The reference site does the same,
 * pinning its renderer to half device pixels.
 */
const MAX_PIXELS = 1_100_000

/** The flow buffer runs at half the composite's linear resolution. */
const FIELD_SCALE = 0.5

/** Seconds of shader time to advance before the first frame. At zero the noise
 *  field is at its least interesting, all octaves crossing together. */
const STATIC_SEED_TIME = 9

/** Tokens the shader reads, in the order the uniforms expect them. */
const PALETTE_TOKENS = ['--forest-deep', '--forest', '--signal', '--on-dark'] as const

type Palette = [number, number, number][]

/**
 * Resolves the site's colour tokens to numbers the shader can use.
 *
 * It goes through a probe element rather than reading the custom properties
 * directly, because getComputedStyle on a custom property hands back the token
 * as authored. Every colour in this stylesheet is a light-dark() pair, so that
 * would be the literal string "light-dark(#0a2120, #0d2220)". Assigning the var
 * to a real property and reading that property back is what forces the cascade
 * to pick a side, and it picks whichever side the current scheme is on.
 *
 * The values come back linearised, matching the pow(1/2.2) the shader applies
 * on the way out. Same exponent both ways, so a mix that lands on an endpoint
 * reproduces the token exactly.
 */
function readPalette(host: HTMLElement): Palette {
  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
  host.appendChild(probe)

  const palette = PALETTE_TOKENS.map((token) => {
    probe.style.color = ''
    probe.style.color = `var(${token})`
    const parts = getComputedStyle(probe).color.match(/[\d.]+/g)
    const rgb = parts ? parts.slice(0, 3).map(Number) : [0, 0, 0]
    return rgb.map((c) => Math.pow(c / 255, 2.2)) as [number, number, number]
  })

  probe.remove()
  return palette
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[HeroShader]', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function link(gl: WebGLRenderingContext, vertex: WebGLShader, fragment: WebGLShader) {
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  // Pinned before linking so both programs take the quad from the same slot and
  // the attribute only has to be enabled once, not re-pointed on every swap.
  gl.bindAttribLocation(program, 0, 'aPosition')
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[HeroShader]', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/**
 * The hero's background: a generated field rather than a gradient.
 *
 * Nothing about it is a loop or a video file. The marbling is domain-warped
 * simplex noise on a clock that never repeats, and the pointer leaves a wake in
 * a small fluid buffer that carries on folding after the pointer has gone. See
 * hero-shader.glsl.ts for what each pass is doing.
 *
 * Three things switch it off, and all of them leave the CSS fallback showing:
 * no WebGL, no reduced motion (which gets one still frame instead), and not on
 * screen. The last one matters most in practice, since this sits at the top of
 * the home page and would otherwise keep a GPU busy for the whole scroll.
 */
export default function HeroShader({ seed = 0 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const dark = window.matchMedia('(prefers-color-scheme: dark)')

    let dispose: ((releaseContext?: boolean) => void) | null = null

    const boot = () => {
      const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        // The field is opaque and repainted whole every frame, so there is
        // nothing to preserve and asking to would cost a copy per frame.
        preserveDrawingBuffer: false,
        powerPreference: 'low-power',
      })
      if (!gl) {
        canvas.dataset.ready = 'fallback'
        return null
      }

      const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
      const flowFragment = compile(gl, gl.FRAGMENT_SHADER, FLOW_SHADER)
      const compositeFragment = compile(gl, gl.FRAGMENT_SHADER, COMPOSITE_SHADER)
      if (!vertex || !flowFragment || !compositeFragment) {
        canvas.dataset.ready = 'fallback'
        return null
      }

      const flowProgram = link(gl, vertex, flowFragment)
      const compositeProgram = link(gl, vertex, compositeFragment)
      if (!flowProgram || !compositeProgram) {
        canvas.dataset.ready = 'fallback'
        return null
      }

      const quad = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      )
      gl.enableVertexAttribArray(0)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

      const flowUniforms = {
        field: gl.getUniformLocation(flowProgram, 'uField'),
        texel: gl.getUniformLocation(flowProgram, 'uTexel'),
        pointer: gl.getUniformLocation(flowProgram, 'uPointer'),
        pointerPrev: gl.getUniformLocation(flowProgram, 'uPointerPrev'),
        amount: gl.getUniformLocation(flowProgram, 'uAmount'),
        aspect: gl.getUniformLocation(flowProgram, 'uAspect'),
        time: gl.getUniformLocation(flowProgram, 'uTime'),
        decay: gl.getUniformLocation(flowProgram, 'uDecay'),
      }
      const compositeUniforms = {
        field: gl.getUniformLocation(compositeProgram, 'uField'),
        aspect: gl.getUniformLocation(compositeProgram, 'uAspect'),
        time: gl.getUniformLocation(compositeProgram, 'uTime'),
        grain: gl.getUniformLocation(compositeProgram, 'uGrain'),
        deep: gl.getUniformLocation(compositeProgram, 'uDeep'),
        forest: gl.getUniformLocation(compositeProgram, 'uForest'),
        signal: gl.getUniformLocation(compositeProgram, 'uSignal'),
        cream: gl.getUniformLocation(compositeProgram, 'uCream'),
      }

      // --- the ping-pong pair -------------------------------------------------
      // RGBA8 rather than float. Half-float targets need two optional
      // extensions that plenty of phones still decline, and the flow buffer is
      // about to be blurred and used as an offset, so eight bits is ample.

      type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer }

      const createTarget = (width: number, height: number): Target | null => {
        const texture = gl.createTexture()
        const framebuffer = gl.createFramebuffer()
        if (!texture || !framebuffer) return null
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          texture,
          0,
        )
        // Ink zero, velocity zero. Velocity is stored biased, so still is 0.5.
        gl.clearColor(0, 0.5, 0.5, 1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        return { texture, framebuffer }
      }

      let targets: [Target, Target] | null = null
      let fieldWidth = 0
      let fieldHeight = 0

      const destroyTargets = () => {
        if (!targets) return
        for (const t of targets) {
          gl.deleteTexture(t.texture)
          gl.deleteFramebuffer(t.framebuffer)
        }
        targets = null
      }

      let palette = readPalette(host)
      let viewWidth = 0
      let viewHeight = 0
      let rect = host.getBoundingClientRect()

      // Multiplier on the pixel budget, lowered if the machine cannot keep up.
      // See the watchdog in the loop below.
      let quality = 1

      const resize = () => {
        const cssWidth = Math.max(host.clientWidth, 1)
        const cssHeight = Math.max(host.clientHeight, 1)

        let width = Math.round(cssWidth * Math.min(window.devicePixelRatio || 1, 2))
        let height = Math.round(cssHeight * Math.min(window.devicePixelRatio || 1, 2))
        const budget = MAX_PIXELS * quality
        const pixels = width * height
        if (pixels > budget) {
          const k = Math.sqrt(budget / pixels)
          width = Math.max(Math.round(width * k), 1)
          height = Math.max(Math.round(height * k), 1)
        }
        if (width === viewWidth && height === viewHeight) return

        viewWidth = width
        viewHeight = height
        canvas.width = width
        canvas.height = height

        fieldWidth = Math.max(Math.round(width * FIELD_SCALE), 64)
        fieldHeight = Math.max(Math.round(height * FIELD_SCALE), 64)
        destroyTargets()
        const a = createTarget(fieldWidth, fieldHeight)
        const b = createTarget(fieldWidth, fieldHeight)
        if (a && b) targets = [a, b]
      }

      // --- pointer ------------------------------------------------------------
      // Tracked on the window rather than the canvas: the canvas is behind the
      // hero image and takes no events, and the wake should keep following the
      // pointer as it crosses that image.

      let pointerX = 0.5
      let pointerY = 0.5
      let prevX = 0.5
      let prevY = 0.5
      let pointerLive = false

      const onPointerMove = (event: PointerEvent) => {
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1)
        // Flipped because GL's origin is the bottom left and the DOM's is not.
        const y = 1 - (event.clientY - rect.top) / Math.max(rect.height, 1)
        const outside = x < -0.15 || x > 1.15 || y < -0.15 || y > 1.15
        if (outside) {
          pointerLive = false
          return
        }
        // Re-entering somewhere else must not drag a stroke across the whole
        // box, so a jump is treated as a fresh start rather than a movement.
        if (!pointerLive || Math.hypot(x - pointerX, y - pointerY) > 0.4) {
          prevX = pointerX = x
          prevY = pointerY = y
          pointerLive = true
          return
        }
        pointerX = x
        pointerY = y
      }

      const refreshRect = () => {
        rect = host.getBoundingClientRect()
      }

      // --- loop ---------------------------------------------------------------

      let elapsed = STATIC_SEED_TIME + seed
      let last = 0
      let raf = 0
      let running = false
      let ready = false

      const drawFlow = (dt: number, amount: number) => {
        if (!targets) return
        const [read, write] = targets
        gl.useProgram(flowProgram)
        gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer)
        gl.viewport(0, 0, fieldWidth, fieldHeight)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, read.texture)
        gl.uniform1i(flowUniforms.field, 0)
        gl.uniform2f(flowUniforms.texel, 1 / fieldWidth, 1 / fieldHeight)
        gl.uniform2f(flowUniforms.pointer, pointerX, pointerY)
        gl.uniform2f(flowUniforms.pointerPrev, prevX, prevY)
        gl.uniform1f(flowUniforms.amount, amount)
        gl.uniform1f(flowUniforms.aspect, viewWidth / viewHeight)
        gl.uniform1f(flowUniforms.time, elapsed)
        // Expressed per second rather than per frame, so a 120Hz display does
        // not clear the wake twice as fast as a 60Hz one. Half-life one second.
        gl.uniform1f(flowUniforms.decay, Math.pow(0.25, dt))
        gl.drawArrays(gl.TRIANGLES, 0, 6)
        targets = [write, read]
      }

      const drawComposite = () => {
        if (!targets) return
        gl.useProgram(compositeProgram)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, viewWidth, viewHeight)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, targets[0].texture)
        gl.uniform1i(compositeUniforms.field, 0)
        gl.uniform1f(compositeUniforms.aspect, viewWidth / viewHeight)
        gl.uniform1f(compositeUniforms.time, elapsed)
        gl.uniform1f(compositeUniforms.grain, 0.035)
        gl.uniform3fv(compositeUniforms.deep, palette[0])
        gl.uniform3fv(compositeUniforms.forest, palette[1])
        gl.uniform3fv(compositeUniforms.signal, palette[2])
        gl.uniform3fv(compositeUniforms.cream, palette[3])
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        if (!ready) {
          ready = true
          canvas.dataset.ready = 'true'
        }
      }

      // --- the watchdog -------------------------------------------------------
      // A fragment this heavy is cheap on a current GPU and not at all cheap on
      // an old integrated one, and there is no property to ask which you are
      // on. So measure: if the frames are genuinely slow, take the resolution
      // down and stay there.
      //
      // The first samples are discarded because shader compilation and the
      // first texture uploads land in them, and quality never rises again,
      // because a budget that moves both ways oscillates around the threshold
      // and the resize it triggers is itself expensive.
      const SLOW_FRAME_MS = 24
      const SAMPLE_SIZE = 60
      const QUALITY_STEPS = [1, 0.6, 0.35]
      let qualityStep = 0
      let samples: number[] = []
      let warmup = 20

      const watchFrameCost = (dt: number) => {
        if (warmup > 0) {
          warmup--
          return
        }
        if (qualityStep >= QUALITY_STEPS.length - 1) return
        samples.push(dt * 1000)
        if (samples.length < SAMPLE_SIZE) return

        samples.sort((a, b) => a - b)
        const median = samples[samples.length >> 1]
        samples = []
        if (median <= SLOW_FRAME_MS) return

        quality = QUALITY_STEPS[++qualityStep]
        // Force resize() past its early-out so the new budget is applied.
        viewWidth = 0
        viewHeight = 0
      }

      const frame = (now: number) => {
        // Capped because a backgrounded tab can hand back a gap of many
        // seconds, and advecting that in one step tears the buffer apart.
        const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20)
        last = now
        elapsed += dt

        watchFrameCost(dt)
        resize()

        // Injection is proportional to speed, so a resting pointer stops
        // adding ink and what it left behind simply decays.
        const moved = pointerLive ? Math.hypot(pointerX - prevX, pointerY - prevY) : 0
        const amount = Math.min(moved * 14, 1) * 0.5

        drawFlow(dt, amount)
        prevX = pointerX
        prevY = pointerY
        drawComposite()

        raf = requestAnimationFrame(frame)
      }

      const start = () => {
        if (running || reduced.matches) return
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }

      const stop = () => {
        if (!running) return
        running = false
        cancelAnimationFrame(raf)
      }

      const drawStill = () => {
        resize()
        drawFlow(1 / 60, 0)
        drawComposite()
      }

      // --- wiring -------------------------------------------------------------

      // Reduced motion still gets the picture, just not the motion: one frame
      // at a seeded time, redrawn only when the box changes size.
      let onScreen = false

      const onVisibility = () => {
        if (document.hidden) stop()
        else if (onScreen) start()
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting
          if (!onScreen) stop()
          else if (!document.hidden) start()
        },
        { threshold: 0 },
      )

      const onResize = () => {
        refreshRect()
        if (reduced.matches) drawStill()
      }

      const onSchemeChange = () => {
        palette = readPalette(host)
        if (reduced.matches) drawStill()
      }

      // The toggle in the header pins data-theme on <html>, which the media
      // query cannot see, so both routes into a scheme change are watched.
      const themeObserver = new MutationObserver(onSchemeChange)
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      })

      if (reduced.matches) {
        drawStill()
      } else {
        window.addEventListener('pointermove', onPointerMove, { passive: true })
        observer.observe(host)
      }

      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('resize', onResize)
      window.addEventListener('scroll', refreshRect, { passive: true })
      dark.addEventListener('change', onSchemeChange)

      // `releaseObjects` is false when the context has already gone. There is
      // nothing to delete out of a context that no longer exists, and the calls
      // are no-ops against a lost one anyway.
      return (releaseObjects = true) => {
        stop()
        observer.disconnect()
        themeObserver.disconnect()
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', refreshRect)
        document.removeEventListener('visibilitychange', onVisibility)
        dark.removeEventListener('change', onSchemeChange)
        delete canvas.dataset.ready

        if (!releaseObjects) return

        // Everything the field allocated, which is all of the GPU memory worth
        // caring about: two RGBA8 targets at half the composite's resolution,
        // plus the programs.
        destroyTargets()
        gl.deleteBuffer(quad)
        gl.deleteProgram(flowProgram)
        gl.deleteProgram(compositeProgram)
        gl.deleteShader(vertex)
        gl.deleteShader(flowFragment)
        gl.deleteShader(compositeFragment)

        // Deliberately NOT WEBGL_lose_context.loseContext().
        //
        // This used to be the last line here, to hand the context back promptly
        // rather than wait for the canvas to be collected. It cannot be: losing
        // a context is a one-way door for the canvas it belongs to. Once lost,
        // getContext('webgl') on that same canvas keeps returning the same dead
        // context — it does not mint a fresh one — so every call in boot()
        // silently returns null and the canvas is finished for the lifetime of
        // the element.
        //
        // That is only survivable if teardown always means the canvas is going
        // away too, and it does not. Three routes here rebuild on the canvas
        // they just tore down: the reduced-motion listener below, a seed change,
        // and React re-running this effect on a mount it treats as a repeat —
        // which is what happens returning to the home page from anywhere else,
        // and which left both fields on that page dead until a reload.
        //
        // So the context outlives the teardown and boot() reuses it. Nothing
        // leaks that matters: the allocations are already freed above, and the
        // bare context goes when the detached canvas is collected.
      }
    }

    // A driver reset, a machine waking from sleep, or too many live contexts on
    // one page all take the context away. Without these two the hero is a dead
    // black rectangle until someone reloads.
    const onLost = (event: Event) => {
      event.preventDefault()
      dispose?.(false)
      dispose = null
    }
    const onRestored = () => {
      dispose = boot()
    }

    // The preference can change while the page is open, and the two branches
    // wire up different listeners, so the cheapest correct answer is to rebuild.
    const onMotionChange = () => {
      dispose?.()
      dispose = boot()
    }

    let active = true
    let idleId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const deferBoot = () => {
      if (!active) return
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => {
          if (active) dispose = boot()
        }, { timeout: 150 })
      } else {
        timeoutId = setTimeout(() => {
          if (active) dispose = boot()
        }, 100)
      }
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    reduced.addEventListener('change', onMotionChange)

    deferBoot()

    return () => {
      active = false
      if (idleId !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      reduced.removeEventListener('change', onMotionChange)
      dispose?.()
      dispose = null
    }
    // seed is read once when the context is built, so changing it rebuilds. It
    // is a constant at every call site, so in practice this never re-runs.
  }, [seed])

  return <canvas ref={canvasRef} className="hero-banner-canvas" aria-hidden="true" />
}
