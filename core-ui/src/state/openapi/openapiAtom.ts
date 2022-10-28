import { atom, RecoilState } from 'recoil';

type OpenapiState = {
  swagger: string;
  paths: Record<string, any>;
} | null;

export const openapiState: RecoilState<OpenapiState> = atom<OpenapiState>({
  key: 'openapiState',
});
