import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';
import { IStatus } from './generic/status';

export interface IServiceBroker extends IMetaDataOwner {
  spec: IServiceBrokerSpec;
  status: IServiceBrokerStatus;

  isStatusOk(): boolean;
}

export interface IServiceBrokerSpec {
  url: string;
}

export interface IServiceBrokerStatus extends IStatus {
  reconciledGeneration: number;
  conditions: IDevelopmentCondition[];
}

export interface IDevelopmentCondition {
  type: string;
  status: string;
  lastTransitionTime: string;
  reason: string;
  message: string;
}

export class ServiceBroker extends MetaDataOwner implements IServiceBroker {
  spec: IServiceBrokerSpec;
  status: IServiceBrokerStatus;

  constructor(input: IServiceBroker) {
    super(input.metadata, input.status);
    this.spec = input.spec;
    this.status = input.status;
  }

  isStatusOk(): boolean {
    return (
      this.status.conditions[this.status.conditions.length - 1].status ===
      'True'
    );
  }
}
