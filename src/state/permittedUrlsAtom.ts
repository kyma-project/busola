import { atom, RecoilState } from 'recoil';

export interface UrlConfig {
  url: string | null;
  timestamp: Date;
}

export type PermittedUrlsState = {
  [url: string]: UrlConfig;
} | null;

const defaultValue = {};

export const permittedUrlsState: RecoilState<PermittedUrlsState> = atom<
  PermittedUrlsState
>({
  key: 'permittedUrlsState',
  default: defaultValue,
});
