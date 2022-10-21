import { atom, RecoilState } from 'recoil';

type OpenapiState = {
  swagger: string;
  paths: Record<string, any>;
} | null;

const defaultValue = null;

export const openapiState: RecoilState<OpenapiState> = atom<OpenapiState>({
  key: 'openapiState',
  default: defaultValue,
});
