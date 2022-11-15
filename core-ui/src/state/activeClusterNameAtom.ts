import { atom, RecoilState } from 'recoil';
import { localStorageEffect, luigiMessageEffect } from './utils/effects';

type ActiveClusterNameAtom = string;

const CURRENT_CLUSTER_NAME_STORAGE_KEY = 'busola.current-cluster-name';
const defaultValue = '';

export const activeClusterNameState: RecoilState<ActiveClusterNameAtom> = atom<
  ActiveClusterNameAtom
>({
  key: 'activeClusterNameState',
  default: defaultValue,
  effects: [
    localStorageEffect<ActiveClusterNameAtom>(CURRENT_CLUSTER_NAME_STORAGE_KEY),
    luigiMessageEffect<ActiveClusterNameAtom>(
      'busola.addCluster',
      'clusterName',
    ),
  ],
});
