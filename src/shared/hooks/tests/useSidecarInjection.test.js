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
  return { setRes, props, ...utils };
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

  it('initialises as disabled when initialRes is null', () => {
    const { result } = setup({ initialRes: null });

    expect(result.current.isSidecarEnabled).toBe(false);
  });

  it('writes the enabled label into the resource once toggled on', () => {
    const res = { metadata: { labels: {} } };
    const { result, setRes } = setup({ res });

    // must batch: isChanged isn't a write-effect dep, so it must be set in the
    // same render as the toggle
    act(() => {
      result.current.setIsChanged(true);
      result.current.setSidecarEnabled(true);
    });

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

    expect(setRes).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          labels: expect.objectContaining({ [label]: 'disabled' }),
        }),
      }),
    );
  });

  it('does not touch the resource while isChanged is false', () => {
    const res = { metadata: { labels: {} } };
    const { result, setRes } = setup({ res });

    // toggling alone must not write to YAML; setIsChanged must be called first
    act(() => {
      result.current.setSidecarEnabled(true);
    });

    expect(setRes).not.toHaveBeenCalled();
  });

  it('turns the toggle off when the label is deleted from the YAML externally', () => {
    const { result, rerender, props } = setup({
      initialRes: { metadata: { labels: { [label]: 'enabled' } } },
      res: { metadata: { labels: { [label]: 'enabled' } } },
    });

    expect(result.current.isSidecarEnabled).toBe(true);

    // form is marked as changed; while the label is still present the toggle stays on
    act(() => {
      result.current.setIsChanged(true);
    });
    expect(result.current.isSidecarEnabled).toBe(true);

    // label removed directly in the YAML -> the reactive effect flips the toggle off
    act(() => {
      rerender({ ...props, res: { metadata: { labels: {} } } });
    });

    expect(result.current.isSidecarEnabled).toBe(false);
  });
});
