import { configMapList } from './data/configMapList';
import { clusterDetailsVersions } from './data/version';
import { clusterDetailsApis } from './data/apis';
import { clusterDetailsEvents } from './data/events';
import { clusterDetailsRuntimeInfo } from './data/runtimeinfo';
import { clusterDetailsSelfSubjectRules } from './data/selfSubjectRulesReviews';
//
import { clusterDetailsQueryRange1 } from './data/query_range1';
import { clusterDetailsQueryRange2 } from './data/queryRange2';
import { clusterDetailsQueryRange3 } from './data/queryRange3';
import { clusterDetailsQueryRange4 } from './data/queryRange4';
import { clusterDetailsQueryRange5 } from './data/queryRange5';
import { clusterDetailsQueryRange6 } from './data/queryRange6';
import { clusterDetailsNodes } from './data/nodes';

export const handlers = [
  ...configMapList,
  ...clusterDetailsSelfSubjectRules,
  ...clusterDetailsRuntimeInfo,
  ...clusterDetailsVersions,
  ...clusterDetailsEvents,
  ...clusterDetailsApis,
  ...clusterDetailsNodes,
  ...clusterDetailsQueryRange1,
  ...clusterDetailsQueryRange2,
  ...clusterDetailsQueryRange3,
  ...clusterDetailsQueryRange4,
  ...clusterDetailsQueryRange5,
  ...clusterDetailsQueryRange6,
];
