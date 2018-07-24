import { IMetaDataOwner, MetaDataOwner } from './generic/meta-data-owner';

export interface IMicroFrontend extends IMetaDataOwner {
  data: {};
  type: string;
  spec: any;

  isStatusOk(): boolean;

  getId(): string;

  getUid(): string;

  getLabel(): string;

  getLocation(): string;
}

export class MicroFrontend extends MetaDataOwner implements IMicroFrontend {
  data: {};
  type: string;
  spec: any;

  constructor(input: IMicroFrontend) {
    super(input.metadata, input.status);
    this.spec = input.spec;
    this.data = input.data;
    this.type = input.type;
  }

  isStatusOk(): boolean {
    return true;
  }

  public getId() {
    return this.metadata.name;
  }

  public getUid() {
    return this.metadata.uid;
  }

  public getLabel() {
    return this.spec.displayName;
  }

  public getLocation() {
    return this.spec.location;
  }
}
