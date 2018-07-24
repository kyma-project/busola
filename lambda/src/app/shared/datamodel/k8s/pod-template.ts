import { IContainer } from './container';
import { IMetaDataOwner } from './generic/meta-data-owner';

export interface IPodTemplate extends IMetaDataOwner {
    spec: IPodTemplateSpec;
}


export interface IPodTemplateSpec {
    containers: IContainer[];
}
