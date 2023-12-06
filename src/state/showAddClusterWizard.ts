import { atom, RecoilState } from 'recoil';

type ShowAddClusterWizard = boolean;

const DEFAULT_SHOW_ADD_CLUSTER_WIZARD = false;

export const showAddClusterWizard: RecoilState<ShowAddClusterWizard> = atom<
  ShowAddClusterWizard
>({
  key: 'showAddClusterWizard',
  default: DEFAULT_SHOW_ADD_CLUSTER_WIZARD,
});
