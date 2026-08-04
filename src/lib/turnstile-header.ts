/**
 * Header the public forms carry the Turnstile token on.
 *
 * Deliberately alone in a module with no imports: the client forms that set it
 * and the Payload hooks that read it both need the name, and anything importing
 * it must not drag `payload` into the browser bundle.
 */
export const TURNSTILE_HEADER = 'x-turnstile-token'
