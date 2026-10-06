import { useCallback, useEffect } from 'react';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { useAtom, useSetAtom, useStore } from 'jotai';
import { Blocker } from 'react-router';

export function useFormNavigation(blocker?: Blocker) {
  const [isResourceEdited, setIsResourceEdited] = useAtom(isResourceEditedAtom);
  const setIsFormOpen = useSetAtom(isFormOpenAtom);
  const store = useStore();

  useEffect(() => {
    if (blocker && blocker.state === 'blocked') {
      setIsResourceEdited((prev) => ({
        ...prev,
        discardAction: () => blocker.proceed(),
      }));
      setIsFormOpen({ formOpen: true, leavingForm: true });
    }
  }, [blocker, setIsFormOpen, setIsResourceEdited]);

  const navigateSafely = useCallback(
    (action: () => void) => {
      // live read: after a save the atoms clear before this closure re-renders
      const { formOpen } = store.get(isFormOpenAtom);
      const { isEdited } = store.get(isResourceEditedAtom);

      if (formOpen && isEdited) {
        // Store the navigation action for later use if the user confirms
        setIsResourceEdited((prevState) => ({
          ...prevState,
          discardAction: () => action(),
        }));
        setIsFormOpen({ formOpen: true, leavingForm: true });
        return;
      }

      action();
    },
    [store, setIsFormOpen, setIsResourceEdited],
  );

  const confirmDiscard = useCallback(
    (leaveFormOpen = false) => {
      if (isResourceEdited.discardAction) {
        isResourceEdited.discardAction();
      }

      // Reset states
      setIsFormOpen({ formOpen: leaveFormOpen, leavingForm: false });
      setIsResourceEdited({ isEdited: false });
    },
    [isResourceEdited, setIsFormOpen, setIsResourceEdited],
  );

  const cancelDiscard = useCallback(() => {
    setIsFormOpen({ formOpen: true, leavingForm: false });
    setIsResourceEdited((prevState) => ({
      ...prevState,
      discardAction: undefined,
    }));
    if (blocker && blocker?.state === 'blocked') {
      blocker.reset();
    }
  }, [setIsFormOpen, setIsResourceEdited, blocker]);

  return {
    navigateSafely,
    confirmDiscard,
    cancelDiscard,
  };
}
