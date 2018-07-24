import { IDashboardMetaDataOwner, DashboardMetaDataOwner } from './generic/dashboard-meta-data-owner';

export interface IDashboardSecret extends IDashboardMetaDataOwner {
  type: string;
}

export class DashboardSecret extends DashboardMetaDataOwner implements IDashboardSecret {
  type: string;
  constructor(input: IDashboardSecret) {
    super(input.objectMeta, input.typeMeta);
    this.type = input.type;
  }
}
