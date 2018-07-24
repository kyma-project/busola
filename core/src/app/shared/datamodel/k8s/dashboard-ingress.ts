import {
  IDashboardMetaDataOwner,
  DashboardMetaDataOwner
} from './generic/dashboard-meta-data-owner';

export class DashboardIngress extends DashboardMetaDataOwner
  implements IDashboardMetaDataOwner {
  constructor(input: IDashboardMetaDataOwner) {
    super(input.objectMeta, input.typeMeta);
  }
}
