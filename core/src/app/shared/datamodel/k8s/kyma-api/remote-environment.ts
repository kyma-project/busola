import { MetaDataOwner } from './../generic/meta-data-owner';
import { IRemoteEnvironment } from './remote-environment';
import { IMetaDataOwner } from '../generic/meta-data-owner';

export interface IRemoteEnvironment extends IMetaDataOwner {
  spec: IRemoteEnvironmentSpec;
}

export interface IRemoteEnvironmentSpec {
  bindings: any[];
  description: string;
  clusterKey: string;
  type: string;
  environment: string;
}

export class RemoteEnvironment extends MetaDataOwner implements IRemoteEnvironment {
  spec: IRemoteEnvironmentSpec;

  constructor(input: IRemoteEnvironment) {
    super(input.metadata, input.status);
    this.spec = input.spec;
  }
}
