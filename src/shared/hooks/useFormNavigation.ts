import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';

export function useFormNavigation() {
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [{ formOpen }, setIsFormOpen] = useRecoilState(isFormOpenState);

  const navigateSafely = useCallback(
    (action: Function) => {
      // Check if we should show the confirmation dialog
      if (formOpen && isResourceEdited.isEdited) {
        // Store the navigation action for later use if the user confirms
        setIsResourceEdited(prevState => ({
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

  const confirmDiscard = useCallback(() => {
    if (isResourceEdited.discardAction) {
      isResourceEdited.discardAction();
    }

    // Reset states
    setIsFormOpen({ formOpen: false, leavingForm: false });
    setIsResourceEdited({ isEdited: false });
  }, [isResourceEdited, setIsFormOpen, setIsResourceEdited]);

  const cancelDiscard = useCallback(() => {
    setIsFormOpen({ formOpen: true, leavingForm: false });
  }, [setIsFormOpen]);

  return {
    navigateSafely,
    confirmDiscard,
    cancelDiscard,
  };
}
