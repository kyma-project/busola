import { ConfigFeature } from 'state/types';
import { ValidKubeconfig } from 'types';

export interface GardenerLoginFeature extends ConfigFeature {
  kubeconfig: ValidKubeconfig;
}
