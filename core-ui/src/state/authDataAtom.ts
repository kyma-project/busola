import { atom, RecoilState } from 'recoil';

export type AuthDataState =
  | { 'client-certificate-data': string; 'client-key-data': string }
  | {
      token: string;
    }
  | null;

export const authDataState: RecoilState<AuthDataState> = atom<AuthDataState>({
  key: 'authDataState',
});
