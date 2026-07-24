// Coalesces concurrent calls into one in-flight promise; clears on settle.
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
