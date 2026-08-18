import { describe, it, expect, vi } from 'vitest';
import { createSingleFlight } from '../singleFlight';

describe('createSingleFlight', () => {
  it('coalesces concurrent calls into one in-flight promise', async () => {
    let resolveFn: (value: string) => void = () => {};
    const fn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFn = resolve;
        }),
    );

    const run = createSingleFlight<string>();

    const p1 = run(fn);
    const p2 = run(fn);

    expect(p1).toBe(p2);
    expect(fn).toHaveBeenCalledTimes(1);

    resolveFn('ok');
    await expect(p1).resolves.toBe('ok');
    await expect(p2).resolves.toBe('ok');
  });

  it('runs the function again after the previous call resolved', async () => {
    const fn = vi.fn().mockResolvedValue('done');
    const run = createSingleFlight<string>();

    await run(fn);
    await run(fn);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('runs the function again after the previous call rejected', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('recovered');
    const run = createSingleFlight<string>();

    await expect(run(fn)).rejects.toThrow('boom');
    await expect(run(fn)).resolves.toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
