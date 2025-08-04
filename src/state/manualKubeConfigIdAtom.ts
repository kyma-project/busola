import { atom, RecoilState } from 'recoil';

export type ManualKubeConfigIdType = {
  formOpen: boolean;
  auth: any;
};

const defaultValue = { formOpen: false, auth: null };

export const manualKubeConfigIdState: RecoilState<ManualKubeConfigIdType> = atom<
  ManualKubeConfigIdType
>({
  key: 'manualKubeConfigIdState',
  default: defaultValue,
});
