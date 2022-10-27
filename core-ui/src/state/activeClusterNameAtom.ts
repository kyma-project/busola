import { atom, RecoilState } from 'recoil';
import { localStorageEffect, luigiMessageEffect } from './utils/effects';

type ActiveClusterNameAtom = string;

const EXPANDED_CATEGORIES_STORAGE_KEY = 'busola.current-cluster-name';
const defaultValue = '';

export const activeClusterNameState: RecoilState<ActiveClusterNameAtom> = atom<
  ActiveClusterNameAtom
>({
  key: 'activeClusterNameState',
  default: defaultValue,
  effects: [
    localStorageEffect<ActiveClusterNameAtom>(EXPANDED_CATEGORIES_STORAGE_KEY),
    luigiMessageEffect<ActiveClusterNameAtom>(
      'busola.setCluster',
      'clusterName',
    ),
  ],
});
