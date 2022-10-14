import { atom, RecoilState } from 'recoil';

type AuthDataState = {
  'client-certificate-data': string;
  'client-key-data': string;
} | null;

const defaultValue = null;

export const authDataState: RecoilState<AuthDataState> = atom<AuthDataState>({
  key: 'authDataState',
  default: defaultValue,
});
