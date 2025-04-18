import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';

export function useFormNavigation() {
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);

  const navigateSafely = useCallback(
    (action: Function) => {
      // Store the navigation action for later use if the user confirms
      setIsResourceEdited(prevState => ({
        ...prevState,
        discardAction: () => action(),
      }));

      // Check if we should show the confirmation dialog
      if (isFormOpen.formOpen && isResourceEdited.isEdited) {
        setIsFormOpen({ formOpen: true, leavingForm: true });
        return;
      }

      // Otherwise, perform the action immediately
      setIsResourceEdited({ isEdited: false });
      action();
    },
    [isFormOpen, isResourceEdited, setIsFormOpen, setIsResourceEdited],
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
    setIsFormOpen(prev => ({ ...prev, leavingForm: false }));
  }, [setIsFormOpen]);

  return {
    navigateSafely,
    confirmDiscard,
    cancelDiscard,
  };
}
