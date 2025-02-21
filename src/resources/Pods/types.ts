// Type should be improved and moved to useGet.js after refactoring it on typeScript.
export type UseGetOptions = Record<string, any>;

export type UsageMetrics = {
  cpu: {
    usage: number;
    capacity: number;
    percentage: string;
    percentageValue: string | number;
  };
  memory: {
    usage: number;
    capacity: number;
    percentage: string;
    percentageValue: string | number;
  };
};

export type ResourceList = {
  cpu?: string;
  memory?: string;
};

export type PodMetricsList = {
  items: {
    metadata: {
      name: string;
      namespace: string;
    };
    containers: {
      name: string;
      usage: ResourceList;
    }[];
  }[];
};

export type PodList = {
  items: {
    metadata: {
      name: string;
      namespace: string;
    };
    spec: {
      nodeName: string;
      containers: {
        name: string;
        resources: {
          limits: ResourceList;
          requests: ResourceList;
        };
      }[];
    };
  }[];
};

export type NodeListItem = {
  metadata: {
    name: string;
  };
  status: {
    allocatable: ResourceList;
  };
};

export type NodeList = {
  items: NodeListItem[];
};
