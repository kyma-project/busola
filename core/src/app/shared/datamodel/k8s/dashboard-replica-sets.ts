import {
  DashboardMetaDataOwner,
  IDashboardMetaDataOwner
} from './generic/dashboard-meta-data-owner';

export interface IDashboardReplicaSets extends IDashboardMetaDataOwner {
  pods: IDashboardReplicaSetsPods;
  containerImages: string[];

  initContainerImages: any;

  getImages();
  getBoundAppName();
}

export interface IDashboardReplicaSetsPods {
  current: number;
  desired: number;
  running: number;
  pending: number;
  failed: number;
  succeeded: number;
  warnings: object[];
}

export class DashboardReplicaSets extends DashboardMetaDataOwner
  implements IDashboardReplicaSets {
  pods: IDashboardReplicaSetsPods;
  containerImages: string[];
  initContainerImages: any;

  constructor(input: IDashboardReplicaSets) {
    super(input.objectMeta, input.typeMeta);
    this.pods = input.pods;
    this.containerImages = input.containerImages;
    this.initContainerImages = input.initContainerImages;
  }

  getImages(): string[] {
    return this.containerImages;
  }

  getBoundAppName(): string {
    let result = 'None';
    if (this.objectMeta.labels.hasOwnProperty('app')) {
      result = this.objectMeta.labels['app'];
    }
    return result;
  }
}
