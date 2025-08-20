import { atom } from 'jotai';

const DEFAULT_SHOW_ADD_CLUSTER_WIZARD = false;

export const showAddClusterWizardAtom = atom<boolean>(
  DEFAULT_SHOW_ADD_CLUSTER_WIZARD,
);
showAddClusterWizardAtom.debugLabel = 'showAddClusterWizardAtom';
