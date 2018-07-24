export interface IRoleBinding {
  metadata: any;
  roleRef: any;
  subjects: any;
}

export class RoleBinding implements IRoleBinding {
  public metadata: any;
  public roleRef: any;
  public subjects: any;

  constructor(input: IRoleBinding) {
    this.metadata = input.metadata;
    this.roleRef = input.roleRef;
    this.subjects = input.subjects;
  }

  public getName(): string {
    return this.metadata.name;
  }
}
