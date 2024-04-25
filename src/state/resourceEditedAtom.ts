import { atom, RecoilState } from 'recoil';

export interface IsResourceEditedState {
  isEdited: boolean;
  warningOpen: boolean;
  discardAction?: Function;
}

const defaultValue = { isEdited: false, warningOpen: false };

export const isResourceEditedState: RecoilState<IsResourceEditedState> = atom<
  IsResourceEditedState
>({
  key: 'isResourceEditedState',
  default: defaultValue,
});
