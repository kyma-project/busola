import { atom, RecoilState } from 'recoil';

type SessionID = string;

const DEFAULT_SESSION_ID = '';

export const sessionIDState: RecoilState<SessionID> = atom<SessionID>({
  key: 'sessionIDState',
  default: DEFAULT_SESSION_ID,
});
