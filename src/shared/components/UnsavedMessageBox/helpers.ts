import { IsResourceEditedState } from 'state/resourceEditedAtom';
import { SetterOrUpdater } from 'recoil';
import { IsFormOpenState } from 'state/formOpenAtom';

export function handleActionIfFormOpen(
  isResourceEdited: IsResourceEditedState,
  setIsResourceEdited: SetterOrUpdater<IsResourceEditedState>,
  isFormOpen: IsFormOpenState,
  setIsFormOpen: SetterOrUpdater<IsFormOpenState>,
  action: Function,
) {
  if (isFormOpen.formOpen) {
    setIsResourceEdited({
      ...isResourceEdited,
      discardAction: () => action(),
    });
    setIsFormOpen({ formOpen: true, leavingForm: true });
    return;
  }
  action();
}
