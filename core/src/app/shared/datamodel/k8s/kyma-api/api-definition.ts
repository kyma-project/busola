import { IMetaDataOwner, MetaDataOwner } from './../generic/meta-data-owner';

export interface IApiDefinition extends IMetaDataOwner {
  spec: IApiDefinitionSpec;
}

export interface IApiDefinitionSpec {
  authorization: any[];
  hostname: string;
}

export interface IApiAuthorization {
  enabled: boolean;
  rules: IApiAuthorizationRule[];
}

export interface IApiAuthorizationRule {
  path: string;
}

export class ApiDefinition extends MetaDataOwner implements IApiDefinition {
  spec: IApiDefinitionSpec;
  constructor(input: IApiDefinition) {
    super(input.metadata, input.status);
    this.spec = input.spec;
  }
}
