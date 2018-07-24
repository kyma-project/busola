export interface IContainer {
    name: string;
    image: string;
    env: IEnvVar[];
    resources: object;
}

export interface IEnvVar {
    name: string;
    value: string;
    valueFrom?: object;
}
