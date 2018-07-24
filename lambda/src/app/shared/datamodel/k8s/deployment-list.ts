import { IDeploymentStatus, IDeployment } from './deployment';
import { IPodTemplate } from './pod-template';
import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';
import { IStatus } from './generic/status';


export interface IDeploymentList extends IMetaDataOwner {
    items: IDeployment[];
}


export class DeploymentList extends MetaDataOwner implements IDeploymentList {
    items: IDeployment[];
    constructor(input: IDeploymentList) {
        super(input.metadata);
        this.items = input.items;
    }
}
