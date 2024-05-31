import { atom, RecoilState } from 'recoil';

export interface IsResourceEditedState {
  isEdited: boolean;
  discardAction?: Function;
  isSaved?: boolean;
}

const defaultValue = { isEdited: false };

export const isResourceEditedState: RecoilState<IsResourceEditedState> = atom<
  IsResourceEditedState
>({
  key: 'isResourceEditedState',
  default: defaultValue,
});
