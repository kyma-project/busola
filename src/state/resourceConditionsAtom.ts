import { atom, RecoilState } from 'recoil';

const defaultValue: [] = [];

export const resourcesConditions: RecoilState<[]> = atom<[]>({
  key: 'resourcesConditions',
  default: defaultValue,
});
