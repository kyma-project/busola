import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';

export interface IService extends IMetaDataOwner {
    data: {};
    type: string;
    spec: IServiceSpec;
}

export class Service extends MetaDataOwner implements IService {
    data: {};
    type: string;
    spec: IServiceSpec;

    constructor(input: IService) {
        super(input.metadata, input.status);
        this.spec = input.spec;
        this.data = input.data;
        this.type = input.type;
    }
}

export interface IServiceSpec {
    ports: IServicePort[];
    selector?: object;
}

export interface IServicePort {
    name: string;
    protocol: string;
    port: number;
    targetPort: number;
}
