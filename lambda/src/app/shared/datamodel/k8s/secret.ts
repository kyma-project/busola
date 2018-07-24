import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';

export interface IData extends IMetaDataOwner {
  data: Map<string, string>;
  type: string;
}
export class Secret extends MetaDataOwner {
  data: Map<string, string>;
  type: string;
  constructor(input?: IData) {
    super(input.metadata, undefined, input.kind, input.apiVersion);
  }
}