import {
  IDashboardMetaDataOwner,
  DashboardMetaDataOwner
} from './generic/dashboard-meta-data-owner';

export interface IDashboardServices extends IDashboardMetaDataOwner {
  internalEndpoint: object;
  externalEndpoints: any;
  selector: object;
  type: string;
  clusterIP: string;
}

export class DashboardServices extends DashboardMetaDataOwner
  implements IDashboardServices {
  internalEndpoint: object;
  externalEndpoints: any;
  selector: object;
  type: string;
  clusterIP: string;

  constructor(input: IDashboardServices) {
    super(input.objectMeta, input.typeMeta);
    this.internalEndpoint = input.internalEndpoint;
    this.externalEndpoints = input.externalEndpoints;
    this.selector = input.selector;
    this.type = input.type;
    this.clusterIP = input.clusterIP;
  }
}
