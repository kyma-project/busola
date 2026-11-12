export function getSampleCount() {
  const raw = Number(process.env.PERF_SAMPLES);
  if (Number.isFinite(raw) && raw >= 1) return Math.floor(raw);
  return 3;
}

/**
 * Measure elapsed ms from `action()` until `readyScript` evaluates truthy in-page.
 * Uses browser-side performance.now(); never relies on networkidle or sleeps.
 */
export async function measureUntil(
  page,
  { action, readyScript, timeoutMs = 60000, pollMs = 50 },
) {
  const start = await page.evaluate(
    () => performance.timeOrigin + performance.now(),
  );
  await action();
  const deadline = Date.now() + timeoutMs;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ready = await page.evaluate((s) => {
      // eslint-disable-next-line no-eval
      try {
        return !!eval(s);
      } catch {
        return false;
      }
    }, readyScript);
    if (ready) break;
    if (Date.now() > deadline) {
      throw new Error(
        `readiness predicate not met within ${timeoutMs}ms: ${readyScript}`,
      );
    }
    await page.waitForTimeout(pollMs);
  }
  const end = await page.evaluate(
    () => performance.timeOrigin + performance.now(),
  );
  return end - start;
}
