export type FunctionToRetry = () => any;

export default async function retry(
  fn: FunctionToRetry,
  maxAttempts = 3,
  retryDelay = 500,
): Promise<boolean> {
  let finished = false;
  for (let i = 0; i < maxAttempts; i++) {
    finished = await fn();
    if (finished) {
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  if (!finished) {
    throw new Error(`All retries failed`);
  }
  return finished;
}
