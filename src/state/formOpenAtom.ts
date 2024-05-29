import { atom, RecoilState } from 'recoil';

export interface IsFormOpenState {
  formOpen: boolean;
  leavingForm: boolean;
}

const defaultValue = { formOpen: false, leavingForm: false };

export const isFormOpenState: RecoilState<IsFormOpenState> = atom<
  IsFormOpenState
>({
  key: 'isFormOpenState',
  default: defaultValue,
});
