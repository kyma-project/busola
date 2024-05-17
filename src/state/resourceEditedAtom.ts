import { atom, RecoilState } from 'recoil';

export interface IsResourceEditedState {
  isEdited: boolean;
  warningOpen: boolean;
  discardAction?: Function;
  isSaved?: boolean;
}

const defaultValue = { isEdited: false, warningOpen: false };

export const isResourceEditedState: RecoilState<IsResourceEditedState> = atom<
  IsResourceEditedState
>({
  key: 'isResourceEditedState',
  default: defaultValue,
});
