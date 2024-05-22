import { IsResourceEditedState } from 'state/resourceEditedAtom';
import { SetterOrUpdater } from 'recoil';

export function handleActionIfResourceEdited(
  isResourceEdited: IsResourceEditedState,
  setIsResourceEdited: SetterOrUpdater<IsResourceEditedState>,
  action: Function,
) {
  if (isResourceEdited.isEdited) {
    setIsResourceEdited({
      ...isResourceEdited,
      warningOpen: true,
      discardAction: () => {
        action();
      },
    });
    return;
  }
  action();
}
