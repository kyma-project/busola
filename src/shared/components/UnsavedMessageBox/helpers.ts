import { IsResourceEditedState } from 'state/resourceEditedAtom';
import { SetterOrUpdater } from 'recoil';

export function handleActionIfFormOpen(
  isResourceEdited: IsResourceEditedState,
  setIsResourceEdited: SetterOrUpdater<IsResourceEditedState>,
  action: Function,
) {
  if (isResourceEdited.isEdited) {
    setIsResourceEdited({
      ...isResourceEdited,
      discardAction: () => {
        action();
      },
    });
    return;
  }
  action();
}
