import {
  DashboardMetaDataOwner,
  IDashboardMetaDataOwner
} from './generic/dashboard-meta-data-owner';

export interface IDashboardPods extends IDashboardMetaDataOwner {
  podStatus: object;
  restartCount: number;
  metrics: any;
  warnings: object[];
  nodeName: string;
}

export class DashboardPods extends DashboardMetaDataOwner
  implements IDashboardPods {
  podStatus: object;
  restartCount: number;
  metrics: any;
  warnings: object[];
  nodeName: string;

  constructor(input: IDashboardPods) {
    super(input.objectMeta, input.typeMeta);
    this.podStatus = input.podStatus;
    this.restartCount = input.restartCount;
    this.metrics = input.metrics;
    this.warnings = input.warnings;
    this.nodeName = input.nodeName;
  }
}
