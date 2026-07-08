// Coalesces concurrent calls into one in-flight promise; clears on settle.
// Prevents two `signinSilent()` calls from racing a rotating refresh token.
export function createSingleFlight<T>() {
  let inFlight: Promise<T> | null = null;
  return function run(fn: () => Promise<T>): Promise<T> {
    if (inFlight) return inFlight;
    inFlight = fn().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}
