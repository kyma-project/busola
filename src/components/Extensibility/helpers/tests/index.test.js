import { vi, describe, it, expect, beforeEach } from 'vitest';
import { jsonataWrapper } from '../jsonataWrapper';
import {
  createTemplate,
  getDefaultPreset,
  throwConfigError,
  getBadgeType,
  getResourceUrl,
  applyFormula,
} from '../index';

vi.mock('../jsonataWrapper', () => ({
  jsonataWrapper: vi.fn(),
}));

describe('createTemplate', () => {
  it('builds apiVersion from group and version when group is present', () => {
    const result = createTemplate({
      version: 'v1alpha1',
      group: 'apps',
      kind: 'Deployment',
    });
    expect(result.apiVersion).toBe('apps/v1alpha1');
  });

  it('uses version alone when group is absent', () => {
    const result = createTemplate({ version: 'v1', group: '', kind: 'Pod' });
    expect(result.apiVersion).toBe('v1');
  });

  it('sets namespace when scope is "namespace" and namespace is provided', () => {
    const result = createTemplate(
      { version: 'v1', group: '', kind: 'Pod' },
      'my-namespace',
      'namespace',
    );
    expect(result.metadata.namespace).toBe('my-namespace');
  });

  it('does not set namespace when scope is not "namespace"', () => {
    const result = createTemplate(
      { version: 'v1', group: '', kind: 'Pod' },
      'my-namespace',
      'cluster',
    );
    expect(result.metadata.namespace).toBeUndefined();
  });

  it('does not set namespace when namespace is falsy', () => {
    const result = createTemplate(
      { version: 'v1', group: '', kind: 'Pod' },
      '',
      'namespace',
    );
    expect(result.metadata.namespace).toBeUndefined();
  });

  it('always includes empty name, labels, annotations, and spec', () => {
    const result = createTemplate({ version: 'v1', group: '', kind: 'Pod' });
    expect(result.metadata.name).toBe('');
    expect(result.metadata.labels).toEqual({});
    expect(result.metadata.annotations).toEqual({});
    expect(result.spec).toEqual({});
  });
});

describe('getDefaultPreset', () => {
  it('returns null when presets is null or undefined', () => {
    expect(getDefaultPreset(null, {})).toBeNull();
    expect(getDefaultPreset(undefined, {})).toBeNull();
  });

  it('returns null when presets array is empty', () => {
    expect(getDefaultPreset([], {})).toBeNull();
  });

  it('returns null when no preset has default: true', () => {
    const presets = [{ name: 'A' }, { name: 'B', default: false }];
    expect(getDefaultPreset(presets, {})).toBeNull();
  });

  it('returns merged preset when one has default: true', () => {
    const emptyTemplate = { spec: { replicas: 1 } };
    const presets = [
      { name: 'A', default: true, value: { spec: { replicas: 3 } } },
    ];
    const result = getDefaultPreset(presets, emptyTemplate);
    expect(result.name).toBe('A');
    expect(result.value.spec.replicas).toBe(3);
  });

  it('uses emptyTemplate as base value in the merged result', () => {
    const emptyTemplate = { spec: { replicas: 1 } };
    const presets = [{ name: 'Default', default: true }];
    const result = getDefaultPreset(presets, emptyTemplate);
    expect(result.value).toEqual(emptyTemplate);
  });
});

describe('throwConfigError', () => {
  it('throws an error with the provided message', () => {
    expect(() => throwConfigError('bad config')).toThrow('bad config');
  });

  it('sets error name to "Extensibility Config Error"', () => {
    try {
      throwConfigError('oops');
    } catch (e) {
      expect(e.name).toBe('Extensibility Config Error');
    }
  });
});

describe('getBadgeType', () => {
  const t = vi.fn((key) => key);

  beforeEach(() => t.mockClear());

  it('returns null when highlights is null or undefined', async () => {
    expect(await getBadgeType(null, 'Running', vi.fn(), t)).toBeNull();
    expect(await getBadgeType(undefined, 'Running', vi.fn(), t)).toBeNull();
  });

  it('skips the "type" key in highlights', async () => {
    const highlights = { type: 'badge', success: ['Running'] };
    expect(await getBadgeType(highlights, 'Running', vi.fn(), t)).toBe(
      'Positive',
    );
  });

  it('matches value in an array rule and returns TYPE_FALLBACK-mapped type', async () => {
    const highlights = { success: ['Running', 'Ready'] };
    expect(await getBadgeType(highlights, 'Running', vi.fn(), t)).toBe(
      'Positive',
    );
  });

  it('does not match when value is not in array rule', async () => {
    const highlights = { success: ['Running'] };
    expect(await getBadgeType(highlights, 'Pending', vi.fn(), t)).toBeNull();
  });

  it('applies TYPE_FALLBACK for "warning" → "Critical"', async () => {
    const highlights = { warning: ['Degraded'] };
    expect(await getBadgeType(highlights, 'Degraded', vi.fn(), t)).toBe(
      'Critical',
    );
  });

  it('applies TYPE_FALLBACK for "error" → "Negative"', async () => {
    const highlights = { error: ['Failed'] };
    expect(await getBadgeType(highlights, 'Failed', vi.fn(), t)).toBe(
      'Negative',
    );
  });

  it('applies TYPE_FALLBACK for "info" → "Information"', async () => {
    const highlights = { info: ['Pending'] };
    expect(await getBadgeType(highlights, 'Pending', vi.fn(), t)).toBe(
      'Information',
    );
  });

  it('normalizes alias "negative" → "Critical"', async () => {
    const highlights = { negative: ['Stopped'] };
    expect(await getBadgeType(highlights, 'Stopped', vi.fn(), t)).toBe(
      'Critical',
    );
  });

  it('normalizes alias "positive" → "Positive"', async () => {
    const highlights = { positive: ['OK'] };
    expect(await getBadgeType(highlights, 'OK', vi.fn(), t)).toBe('Positive');
  });

  it('normalizes alias "informative" → "Information"', async () => {
    const highlights = { informative: ['Unknown'] };
    expect(await getBadgeType(highlights, 'Unknown', vi.fn(), t)).toBe(
      'Information',
    );
  });

  it('normalizes alias "critical" → "Negative"', async () => {
    const highlights = { critical: ['Error'] };
    expect(await getBadgeType(highlights, 'Error', vi.fn(), t)).toBe(
      'Negative',
    );
  });

  it('normalizes alias "none" → "None"', async () => {
    const highlights = { none: ['Idle'] };
    expect(await getBadgeType(highlights, 'Idle', vi.fn(), t)).toBe('None');
  });

  it('uses jsonata fn for non-array rules and returns type when it matches', async () => {
    const jsonata = vi.fn().mockResolvedValue([true, null]);
    const highlights = { success: 'someExpression' };
    expect(await getBadgeType(highlights, 'any', jsonata, t)).toBe('Positive');
    expect(jsonata).toHaveBeenCalledWith('someExpression');
  });

  it('skips a rule when jsonata returns an error and tries next rule', async () => {
    const jsonata = vi
      .fn()
      .mockResolvedValueOnce([null, new Error('parse error')])
      .mockResolvedValueOnce([true, null]);
    const highlights = { success: 'badExpr', warning: 'goodExpr' };
    expect(await getBadgeType(highlights, 'any', jsonata, t)).toBe('Critical');
  });
});

describe('getResourceUrl', () => {
  it('returns null when descID is null or undefined', () => {
    expect(getResourceUrl(null)).toBeNull();
    expect(getResourceUrl(undefined)).toBeNull();
  });

  it('returns null when text contains no links', () => {
    expect(getResourceUrl('no links here')).toBeNull();
  });

  it('extracts URL from a markdown link', () => {
    expect(getResourceUrl('[docs](https://example.com/guide)')).toBe(
      'https://example.com/guide',
    );
  });

  it('strips helm-style brackets before extracting a link', () => {
    expect(getResourceUrl('{{"[docs](https://example.com/)"}}')).toBe(
      'https://example.com/',
    );
  });

  it('returns only the first URL when multiple links are present', () => {
    const text = '[first](https://first.com) and [second](https://second.com)';
    expect(getResourceUrl(text)).toBe('https://first.com');
  });
});

describe('applyFormula', () => {
  const t = vi.fn((key, opts) => `${key}: ${opts?.error}`);

  beforeEach(() => {
    t.mockClear();
    jsonataWrapper.mockReset();
  });

  it('returns the evaluated result on success', async () => {
    const evaluate = vi.fn().mockResolvedValue('computed');
    jsonataWrapper.mockReturnValue({ evaluate });

    const result = await applyFormula('myValue', '$data', t);
    expect(result).toBe('computed');
    expect(evaluate).toHaveBeenCalledWith({ data: 'myValue' });
  });

  it('spreads additionalSources into the evaluate call', async () => {
    const evaluate = vi.fn().mockResolvedValue(42);
    jsonataWrapper.mockReturnValue({ evaluate });

    await applyFormula('val', '$item', t, { item: { x: 1 } });
    expect(evaluate).toHaveBeenCalledWith({ data: 'val', item: { x: 1 } });
  });

  it('calls t with the error message when evaluation throws', async () => {
    jsonataWrapper.mockReturnValue({
      evaluate: vi.fn().mockRejectedValue(new Error('syntax error')),
    });

    const result = await applyFormula('val', 'bad $$$', t);
    expect(t).toHaveBeenCalledWith('extensibility.configuration-error', {
      error: 'syntax error',
    });
    expect(result).toContain('syntax error');
  });
});
