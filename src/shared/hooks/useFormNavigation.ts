import { useCallback } from 'react';
import { isResourceEditedAtom } from 'state/resourceEditedAtom';
import { isFormOpenAtom } from 'state/formOpenAtom';
import { useAtom } from 'jotai';

export function useFormNavigation() {
  const [isResourceEdited, setIsResourceEdited] = useAtom(isResourceEditedAtom);
  const [{ formOpen }, setIsFormOpen] = useAtom(isFormOpenAtom);

  const navigateSafely = useCallback(
    (action: Function) => {
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
    [formOpen, isResourceEdited, setIsFormOpen, setIsResourceEdited],
  );

  const confirmDiscard = useCallback(
    (leaveFromOpen = false) => {
      if (isResourceEdited.discardAction) {
        isResourceEdited.discardAction();
      }

      // Reset states
      setIsFormOpen({ formOpen: leaveFromOpen, leavingForm: false });
      setIsResourceEdited({ isEdited: false });
    },
    [isResourceEdited, setIsFormOpen, setIsResourceEdited],
  );

  const cancelDiscard = useCallback(() => {
    setIsFormOpen({ formOpen: true, leavingForm: false });
  }, [setIsFormOpen]);

  return {
    navigateSafely,
    confirmDiscard,
    cancelDiscard,
  };
}
