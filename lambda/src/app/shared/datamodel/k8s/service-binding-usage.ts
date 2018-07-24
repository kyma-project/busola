import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';

export interface IServiceBindingUsage extends IMetaDataOwner {
    spec?: IServiceBindingUsageSpec;
}


export interface IServiceBindingUsageSpec {
    serviceBindingRef: ILocalReferenceByName;
    usedBy: ILocalReferenceByKindAndName;
}

export interface ILocalReferenceByName {
    name: string;
}

export interface ILocalReferenceByKindAndName {
    name: string;
    kind: string;
}

export interface IServiceBindingUsageList extends IMetaDataOwner {
    items: IServiceBindingUsage[];
}

export class ServiceBindingUsage extends MetaDataOwner implements IServiceBindingUsage {
    spec?: IServiceBindingUsageSpec;
    constructor(input?: IServiceBindingUsage) {
        super(input.metadata, input.status, input.kind, input.apiVersion);
        this.spec = input.spec;
    }
}
