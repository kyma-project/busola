import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { useDispatch, useSelector } from 'react-redux';
import { getIsFormOpenState, setIsFormOpenState } from 'state/formOpenSlice';

export function useFormNavigation() {
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const { formOpen } = useSelector(getIsFormOpenState);
  const dispatch = useDispatch();

  const navigateSafely = useCallback(
    (action: Function) => {
      // Check if we should show the confirmation dialog
      if (formOpen && isResourceEdited.isEdited) {
        // Store the navigation action for later use if the user confirms
        setIsResourceEdited(prevState => ({
          ...prevState,
          discardAction: () => action(),
        }));
        dispatch(setIsFormOpenState({ formOpen: true, leavingForm: true }));
        return;
      }

      action();
    },
    [formOpen, isResourceEdited, dispatch, setIsResourceEdited],
  );

  const confirmDiscard = useCallback(() => {
    if (isResourceEdited.discardAction) {
      isResourceEdited.discardAction();
    }

    // Reset states
    dispatch(setIsFormOpenState({ formOpen: false, leavingForm: false }));
    setIsResourceEdited({ isEdited: false });
  }, [isResourceEdited, dispatch, setIsResourceEdited]);

  const cancelDiscard = useCallback(() => {
    dispatch(setIsFormOpenState({ formOpen: true, leavingForm: false }));
  }, [dispatch]);

  return {
    navigateSafely,
    confirmDiscard,
    cancelDiscard,
  };
}
