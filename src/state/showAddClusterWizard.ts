import { atom } from 'jotai';

const DEFAULT_SHOW_ADD_CLUSTER_WIZARD = false;

export const showAddClusterWizard = atom<boolean>(
  DEFAULT_SHOW_ADD_CLUSTER_WIZARD,
);
showAddClusterWizard.debugLabel = 'showAddClusterWizard';
