import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider, useAtomValue } from 'jotai';
import { ReactNode } from 'react';
import { Blocker } from 'react-router';
import { JotaiHydrator } from 'testing/reactTestingUtils';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { useFormNavigation } from '../useFormNavigation';

function makeWrapper({ formOpen = false, isEdited = false } = {}) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider>
      <JotaiHydrator
        initialValues={[
          [isFormOpenAtom, { formOpen, leavingForm: false }],
          [isResourceEditedAtom, { isEdited }],
        ]}
      >
        {children}
      </JotaiHydrator>
    </Provider>
  );
  return Wrapper;
}

// Renders the hook together with a probe of the atoms it writes to, so tests
// can assert the resulting state, not just that the injected callbacks fired.
function renderNav({
  formOpen = false,
  isEdited = false,
  blocker,
}: { formOpen?: boolean; isEdited?: boolean; blocker?: Blocker } = {}) {
  return renderHook(
    ({ blocker }: { blocker?: Blocker }) => {
      const nav = useFormNavigation(blocker);
      const form = useAtomValue(isFormOpenAtom);
      const edited = useAtomValue(isResourceEditedAtom);
      return {
        ...nav,
        formOpen: form.formOpen,
        leavingForm: form.leavingForm,
        isEdited: edited.isEdited,
        hasDiscardAction: !!edited.discardAction,
      };
    },
    {
      wrapper: makeWrapper({ formOpen, isEdited }),
      initialProps: { blocker } as { blocker?: Blocker },
    },
  );
}

describe('useFormNavigation', () => {
  it('runs the navigation action immediately when the form is not open', () => {
    const { result } = renderNav({ formOpen: false, isEdited: true });
    const action = vi.fn();

    act(() => result.current.navigateSafely(action));

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('runs the action immediately when the form is open but unedited', () => {
    const { result } = renderNav({ formOpen: true, isEdited: false });
    const action = vi.fn();

    act(() => result.current.navigateSafely(action));

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('defers the action when the form is open and edited, then runs it on confirm', () => {
    const { result } = renderNav({ formOpen: true, isEdited: true });
    const action = vi.fn();

    act(() => result.current.navigateSafely(action));
    expect(action).not.toHaveBeenCalled();
    expect(result.current.leavingForm).toBe(true);
    expect(result.current.hasDiscardAction).toBe(true);

    act(() => result.current.confirmDiscard());
    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.formOpen).toBe(false);
    expect(result.current.isEdited).toBe(false);
    expect(result.current.hasDiscardAction).toBe(false);
  });

  it('keeps the form open on confirmDiscard(true) while clearing the edited state', () => {
    const { result } = renderNav({ formOpen: true, isEdited: true });

    act(() => result.current.navigateSafely(vi.fn()));
    act(() => result.current.confirmDiscard(true));

    expect(result.current.formOpen).toBe(true);
    expect(result.current.leavingForm).toBe(false);
    expect(result.current.isEdited).toBe(false);
  });

  it('stores the blocker proceed as the discard action when navigation is blocked', () => {
    const proceed = vi.fn();
    const reset = vi.fn();
    const blocker = { state: 'blocked', proceed, reset } as unknown as Blocker;

    const { result } = renderNav({ formOpen: true, isEdited: true, blocker });

    expect(result.current.leavingForm).toBe(true);

    act(() => result.current.confirmDiscard());
    expect(proceed).toHaveBeenCalledTimes(1);
  });

  it('cancelDiscard resets a blocked blocker and drops the pending action', () => {
    const proceed = vi.fn();
    const reset = vi.fn();
    const blocker = { state: 'blocked', proceed, reset } as unknown as Blocker;

    const { result } = renderNav({ formOpen: true, isEdited: true, blocker });

    act(() => result.current.cancelDiscard());
    expect(reset).toHaveBeenCalledTimes(1);
    expect(result.current.hasDiscardAction).toBe(false);
    expect(result.current.leavingForm).toBe(false);
  });

  it('cancelDiscard drops the pending action so a later confirmDiscard is a no-op', () => {
    const { result } = renderNav({ formOpen: true, isEdited: true });
    const action = vi.fn();

    act(() => result.current.navigateSafely(action));
    expect(action).not.toHaveBeenCalled();

    act(() => result.current.cancelDiscard());
    act(() => result.current.confirmDiscard());

    expect(action).not.toHaveBeenCalled();
  });

  it('lets a blocker firing after navigateSafely take over the discard action', () => {
    const proceed = vi.fn();
    const reset = vi.fn();
    const action = vi.fn();
    const unblocked = {
      state: 'unblocked',
      proceed,
      reset,
    } as unknown as Blocker;
    const blocked = { state: 'blocked', proceed, reset } as unknown as Blocker;

    const { result, rerender } = renderNav({
      formOpen: true,
      isEdited: true,
      blocker: unblocked,
    });

    act(() => result.current.navigateSafely(action));
    expect(action).not.toHaveBeenCalled();

    rerender({ blocker: blocked });

    act(() => result.current.confirmDiscard());
    expect(proceed).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
  });
});
