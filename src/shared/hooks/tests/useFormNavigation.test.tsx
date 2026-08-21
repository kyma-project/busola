import { renderHook, act } from '@testing-library/react';
import { Provider } from 'jotai';
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

describe('useFormNavigation', () => {
  it('runs the navigation action immediately when the form is not open', () => {
    const { result } = renderHook(() => useFormNavigation(), {
      wrapper: makeWrapper({ formOpen: false, isEdited: true }),
    });
    const action = vi.fn();

    act(() => result.current.navigateSafely(action));

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('runs the action immediately when the form is open but unedited', () => {
    const { result } = renderHook(() => useFormNavigation(), {
      wrapper: makeWrapper({ formOpen: true, isEdited: false }),
    });
    const action = vi.fn();

    act(() => result.current.navigateSafely(action));

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('defers the action when the form is open and edited, then runs it on confirm', () => {
    const { result } = renderHook(() => useFormNavigation(), {
      wrapper: makeWrapper({ formOpen: true, isEdited: true }),
    });
    const action = vi.fn();

    act(() => result.current.navigateSafely(action));
    expect(action).not.toHaveBeenCalled();

    act(() => result.current.confirmDiscard());
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('stores the blocker proceed as the discard action when navigation is blocked', () => {
    const proceed = vi.fn();
    const reset = vi.fn();
    const blocker = { state: 'blocked', proceed, reset } as unknown as Blocker;

    const { result } = renderHook(() => useFormNavigation(blocker), {
      wrapper: makeWrapper({ formOpen: true, isEdited: true }),
    });

    act(() => result.current.confirmDiscard());
    expect(proceed).toHaveBeenCalledTimes(1);
  });

  it('cancelDiscard resets a blocked blocker', () => {
    const proceed = vi.fn();
    const reset = vi.fn();
    const blocker = { state: 'blocked', proceed, reset } as unknown as Blocker;

    const { result } = renderHook(() => useFormNavigation(blocker), {
      wrapper: makeWrapper({ formOpen: true, isEdited: true }),
    });

    act(() => result.current.cancelDiscard());
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
