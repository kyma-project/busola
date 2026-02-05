import { useCallback, useEffect } from 'react';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { useAtom } from 'jotai';
import { Blocker } from 'react-router';

export function useFormNavigation(blocker?: Blocker) {
  const [isResourceEdited, setIsResourceEdited] = useAtom(isResourceEditedAtom);
  const [{ formOpen }, setIsFormOpen] = useAtom(isFormOpenAtom);

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
      // Check if we should show the confirmation dialog
      if (formOpen && isResourceEdited.isEdited) {
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
    [formOpen, isResourceEdited.isEdited, setIsFormOpen, setIsResourceEdited],
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
    if (blocker && blocker?.state === 'blocked') {
      blocker.reset();
    }
  }, [setIsFormOpen, blocker]);

  return {
    navigateSafely,
    confirmDiscard,
    cancelDiscard,
  };
}
