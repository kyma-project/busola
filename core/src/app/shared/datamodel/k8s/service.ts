import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';

export interface IService extends IMetaDataOwner {
  data: {};
  type: string;
  spec: any;
}

export class Service extends MetaDataOwner implements IService {
  data: {};
  type: string;
  spec: any;

  constructor(input: IService) {
    super(input.metadata, input.status);
    this.spec = input.spec;
    this.data = input.data;
    this.type = input.type;
  }
}
