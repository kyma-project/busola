import { describe, it, expect, vi, afterEach } from 'vitest';
import { discoverFeature, getFeatures } from '../getFeatures';

describe('discoverFeature', () => {
  afterEach(() => vi.restoreAllMocks());
  it('returns { isEnabled: false } when rawFeatureConfig is undefined', async () => {
    const result = await discoverFeature('EXTENSIBILITY', undefined);
    expect(result).toEqual({ isEnabled: false });
  });

  it('returns rawFeatureConfig unchanged when isEnabled is explicitly false', async () => {
    const config = { isEnabled: false, someExtra: 'value' };
    const result = await discoverFeature('EXTENSIBILITY', config);
    expect(result).toEqual(config);
  });

  it('returns config with isEnabled: true when no checks are defined', async () => {
    const config = { isEnabled: true };
    const result = await discoverFeature('EXTENSIBILITY', config);
    expect(result).toEqual({ isEnabled: true });
  });

  it('runs checks in order and merges their results into config', async () => {
    const check1 = vi.fn().mockResolvedValue({ extra: 'fromCheck1' });
    const check2 = vi.fn().mockResolvedValue({ another: 'fromCheck2' });
    const config = { isEnabled: true, checks: [check1, check2] };

    const result = await discoverFeature('SENTRY', config);

    expect(check1).toHaveBeenCalledWith('SENTRY', {
      isEnabled: true,
      checks: [check1, check2],
    });
    expect(check2).toHaveBeenCalledWith(
      'SENTRY',
      expect.objectContaining({ extra: 'fromCheck1' }),
    );
    expect(result).toMatchObject({
      isEnabled: true,
      extra: 'fromCheck1',
      another: 'fromCheck2',
    });
  });

  it('passes the accumulated config (not the original) to each subsequent check', async () => {
    const check1 = vi.fn().mockResolvedValue({ step: 1 });
    const check2 = vi.fn().mockResolvedValue({ step: 2 });
    const config = { isEnabled: true, checks: [check1, check2] };

    await discoverFeature('SNOW', config);

    const secondCallArg = check2.mock.calls[0][1];
    expect(secondCallArg.step).toBe(1);
  });

  it('disables the feature when a check resolves with { isEnabled: false }', async () => {
    const disablingCheck = vi.fn().mockResolvedValue({ isEnabled: false });
    const config = { isEnabled: true, checks: [disablingCheck] };

    const result = await discoverFeature('EXTENSIBILITY', config);

    expect(result).toMatchObject({ isEnabled: false });
  });

  it('returns { isEnabled: false } and warns when a check throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const failingCheck = vi.fn().mockRejectedValue(new Error('network error'));
    const config = { isEnabled: true, checks: [failingCheck] };

    const result = await discoverFeature('KUBECONFIG_ID', config);

    expect(result).toMatchObject({ isEnabled: false });
    expect(warnSpy).toHaveBeenCalled();
  });

  it('treats a config with no isEnabled field as enabled and runs checks', async () => {
    const check = vi.fn().mockResolvedValue({ ready: true });
    const config = { checks: [check] };

    const result = await discoverFeature('FEEDBACK', config as any);

    expect(result).toMatchObject({ isEnabled: true, ready: true });
  });
});

describe('getFeatures', () => {
  afterEach(() => vi.restoreAllMocks());
  it('returns an empty object when rawFeatures is undefined', async () => {
    const result = await getFeatures(undefined);
    expect(result).toEqual({});
  });

  it('returns an empty object when rawFeatures is empty', async () => {
    const result = await getFeatures({});
    expect(result).toEqual({});
  });

  it('resolves each feature independently', async () => {
    const features = {
      EXTENSIBILITY: { isEnabled: true },
      SNOW: { isEnabled: false },
    } as any;

    const result = await getFeatures(features);

    expect(result.EXTENSIBILITY).toMatchObject({ isEnabled: true });
    expect(result.SNOW).toMatchObject({ isEnabled: false });
  });

  it('resolves a feature with checks', async () => {
    const check = vi.fn().mockResolvedValue({ endpoint: 'http://sentry.io' });
    const features = {
      SENTRY: { isEnabled: true, checks: [check] },
    } as any;

    const result = await getFeatures(features);

    expect(result.SENTRY).toMatchObject({
      isEnabled: true,
      endpoint: 'http://sentry.io',
    });
  });

  it('disables a feature whose check throws, leaving others intact', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const failingCheck = vi.fn().mockRejectedValue(new Error('fail'));
    const features = {
      SENTRY: { isEnabled: true, checks: [failingCheck] },
      FEEDBACK: { isEnabled: true },
    } as any;

    const result = await getFeatures(features);

    expect(result.SENTRY).toMatchObject({ isEnabled: false });
    expect(result.FEEDBACK).toMatchObject({ isEnabled: true });
    expect(warnSpy).toHaveBeenCalled();
  });
});
