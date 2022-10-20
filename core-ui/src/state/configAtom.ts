import { atom, RecoilState } from 'recoil';

export type FromConfig = (domain: string, backendAddress: string) => string;

export type ConfigURL = {
  fromConfig: FromConfig;
} | null;

const defaultValue: ConfigURL = null;

export const configState: RecoilState<ConfigURL> = atom<ConfigURL>({
  key: 'configState',
  default: defaultValue,
});
