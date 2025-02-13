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

export type StatusData = {
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
      usage: StatusData;
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
          limits: StatusData;
          requests: StatusData;
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
    allocatable: StatusData;
  };
};

export type NodeList = {
  items: NodeListItem[];
};
