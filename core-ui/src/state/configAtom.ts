import { atom, RecoilState } from 'recoil';

type ConfigState = {
  fromConfig: (domain: string, backendAddress: string) => string;
} | null;

const defaultValue: ConfigState = null;

export const configState: RecoilState<ConfigState> = atom<ConfigState>({
  key: 'configState',
  default: defaultValue,
});
