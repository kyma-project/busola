import { atom, RecoilState } from 'recoil';

type OpenapiState = {
  swagger: string;
  paths: Record<string, any>;
};

const defaultValue = {
  swagger: '2.0',
  paths: {},
};

export const openapiState: RecoilState<OpenapiState> = atom<OpenapiState>({
  key: 'openapiState',
  default: defaultValue,
});
