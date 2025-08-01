import { atom, RecoilState } from 'recoil';

export type ManualKubeConfigIdType = {
  formOpen: boolean;
  token: string;
};

const defaultValue = { formOpen: false, token: '' };

export const manualKubeConfigIdState: RecoilState<ManualKubeConfigIdType> = atom<
  ManualKubeConfigIdType
>({
  key: 'manualKubeConfigIdState',
  default: defaultValue,
});
