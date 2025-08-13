import { atom } from 'jotai';

export interface UrlConfig {
  url: string | null;
  timestamp: Date;
}

export type PermittedUrlsState = {
  [url: string]: UrlConfig;
} | null;

const defaultValue = {};

export const permittedUrlsState = atom<PermittedUrlsState>(defaultValue);
permittedUrlsState.debugLabel = 'permittedUrlsState';
