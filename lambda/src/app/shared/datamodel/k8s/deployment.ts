import { IDeploymentStatus } from './deployment';
import { IPodTemplate } from './pod-template';
import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';
import { IStatus } from './generic/status';


export interface IDeployment extends IMetaDataOwner {
    spec: IDeploymentSpec;
    status?: IDeploymentStatus;

    getImages?(): string[];
    isStatusOk?(): boolean;
}

export interface IDeploymentSpec {
    replicas?: number;
    template: IPodTemplate;
}

export interface IDeploymentStatus extends IStatus {
    replicas: number;
    updatedReplicas: number;
    readyReplicas: number;
    availableReplicas: number;
    conditions: IDevelopmentCondition[];
}

export interface IDevelopmentCondition {
    lastTransitionTime: string;
    lastUpdateTime: string;
    status: string;
    reason: string;
    message: string;
}

export class Deployment extends MetaDataOwner implements IDeployment {
    spec: IDeploymentSpec;
    status: IDeploymentStatus;

    constructor(input: IDeployment) {
        super(input.metadata, input.status);
        this.spec = input.spec;
    }

    getImages(): string[] {
        const result = [];
        this.spec.template.spec.containers.forEach(container => result.push(container.image));
        return result;
    }

    isStatusOk(): boolean {
        return this.status.conditions[this.status.conditions.length - 1].status === 'True';
    }

    getBoundAppName(): string {
        let result = 'None';
        if (this.metadata.labels.hasOwnProperty('app')) {
            result = this.metadata.labels['app'];
        }
        return result;
    }
}
