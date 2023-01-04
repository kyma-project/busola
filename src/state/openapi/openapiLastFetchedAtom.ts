import { atom, RecoilState } from 'recoil';

type OpenapiLastFethedState = string | null;

export const defaultValue = null;

export const openapiLastFetchedState: RecoilState<OpenapiLastFethedState> = atom<
  OpenapiLastFethedState
>({
  key: 'openapiLastFetchedState',
  default: defaultValue,
});
