import { renderHook, act } from '@testing-library/react';
import { useSidecar } from '../useSidecarInjection';

const path = '$.metadata.labels';
const label = 'istio-injection';

function setup(overrides = {}) {
  const setRes = vi.fn();
  const props = {
    initialRes: { metadata: { labels: {} } },
    res: { metadata: { labels: {} } },
    setRes,
    path,
    label,
    enabled: 'enabled',
    disabled: 'disabled',
    ...overrides,
  };
  const utils = renderHook((p) => useSidecar(p), { initialProps: props });
  return { setRes, ...utils };
}

describe('useSidecar', () => {
  it('initialises as enabled when the label already equals the enabled value', () => {
    const { result } = setup({
      initialRes: { metadata: { labels: { [label]: 'enabled' } } },
    });

    expect(result.current.isSidecarEnabled).toBe(true);
  });

  it('initialises as disabled when the label is missing', () => {
    const { result } = setup();

    expect(result.current.isSidecarEnabled).toBe(false);
  });

  it('writes the enabled label into the resource once toggled on', () => {
    const res = { metadata: { labels: {} } };
    const { result, setRes } = setup({ res });

    act(() => {
      result.current.setIsChanged(true);
      result.current.setSidecarEnabled(true);
    });

    expect(res.metadata.labels[label]).toBe('enabled');
    expect(setRes).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          labels: expect.objectContaining({ [label]: 'enabled' }),
        }),
      }),
    );
  });

  it('writes the disabled label when toggled off', () => {
    const res = { metadata: { labels: { [label]: 'enabled' } } };
    const { result, setRes } = setup({
      res,
      initialRes: { metadata: { labels: { [label]: 'enabled' } } },
    });

    act(() => {
      result.current.setIsChanged(true);
      result.current.setSidecarEnabled(false);
    });

    expect(res.metadata.labels[label]).toBe('disabled');
    expect(setRes).toHaveBeenCalled();
  });

  it('does not touch the resource while isChanged is false', () => {
    const res = { metadata: { labels: {} } };
    const { result, setRes } = setup({ res });

    // toggling alone must not write to YAML; setIsChanged must be called first
    act(() => {
      result.current.setSidecarEnabled(true);
    });

    expect(res.metadata.labels[label]).toBeUndefined();
    expect(setRes).not.toHaveBeenCalled();
  });
});
