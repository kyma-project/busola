import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';
import { Service } from './api-service';
import { AuthenticationRule } from './api-authentication-rule';

export interface IApi extends IMetaDataOwner {
    spec: IApiSpec;
}

export interface IApiSpec {
    service: Service;
    hostname: string;
    authentication: AuthenticationRule[];
}

export class Api extends MetaDataOwner implements IApi {
    spec: IApiSpec;
    constructor(input?: IApi) {
        super(input.metadata, input.status, input.kind, input.apiVersion);
        this.spec = input.spec;
    }
}
