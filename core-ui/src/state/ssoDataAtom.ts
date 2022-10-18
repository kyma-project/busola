import { atom, RecoilState } from 'recoil';

type SsoDataState = {
  idToken?: string;
} | null;

const defaultValue: SsoDataState = null;

export const ssoDataState: RecoilState<SsoDataState> = atom<SsoDataState>({
  key: 'ssoDataState',
  default: defaultValue,
});
