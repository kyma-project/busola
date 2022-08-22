import { loadBalancer } from './loadBalancer';
import { connectionPool } from './connectionPool';
import { outlierDetection } from './outlierDetection';
import { tls } from './tls';
import { portLevelSettings } from './portLevelSettings';
import { tunnel } from './tunnel';

export const trafficPolicyBundle = [
  loadBalancer,
  connectionPool,
  outlierDetection,
  tls,
  portLevelSettings,
  tunnel,
];
