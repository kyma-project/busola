export default async function retry(
  fn: Function,
  maxAttempts = 3,
  retryDelay = 500,
): Promise<boolean> {
  let finished = false;
  for (let i = 0; i < maxAttempts; i++) {
    finished = await fn();
    if (finished) {
      break;
    } else {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  return finished;
}
