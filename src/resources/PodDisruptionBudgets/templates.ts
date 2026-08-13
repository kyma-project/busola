type PodDisruptionBudgetTemplateArgs = {
  minAvailable?: number;
  maxUnavailable?: number;
  currentHealthy?: number;
  desiredHealthy?: number;
  disruptionsAllowed?: number;
  expectedPods?: number;
  observedGeneration?: number;
  name?: string;
  namespaceName?: string;
};

export function createPodDisruptionBudgetTemplate({
  minAvailable = 1,
  maxUnavailable = 0,
  currentHealthy,
  desiredHealthy,
  disruptionsAllowed,
  expectedPods,
  observedGeneration,
  name = '',
  namespaceName = '',
}: PodDisruptionBudgetTemplateArgs) {
  return {
    apiVersion: 'policy/v1',
    kind: 'PodDisruptionBudget',
    metadata: {
      name,
      namespace: namespaceName,
    },
    spec: {
      minAvailable: minAvailable,
      maxUnavailable: maxUnavailable,
    },
    status: {
      currentHealthy: currentHealthy ?? 0,
      desiredHealthy: desiredHealthy ?? 0,
      disruptionsAllowed: disruptionsAllowed ?? 0,
      expectedPods: expectedPods ?? 0,
      observedGeneration,
    },
  };
}
