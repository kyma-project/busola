export type PodDisruptionBudgetsListProps = {
  namespace: string;
  resourceType: string;
  resourceUrl: string;
  disableCreate?: boolean;
  [key: string]: any;
};

export type PodDisruptionBudget = {
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    minAvailable: number;
    maxUnavailable: number;
    selector: {
      matchLabels: Record<string, string>;
      matchExpressions?: any[];
    };
  };
  status: {
    currentHealthy?: number;
    desiredHealthy?: number;
    disruptionsAllowed?: number;
    expectedPods?: number;
    observedGeneration?: number;
    conditions?: Record<string, any>[];
  };
};
