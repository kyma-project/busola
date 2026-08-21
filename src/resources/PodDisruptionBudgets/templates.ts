type PodDisruptionBudgetTemplateArgs = {
  minAvailable?: number;
  name?: string;
  namespaceName?: string;
};

export function createPodDisruptionBudgetTemplate({
  minAvailable = 1,
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
    },
  };
}
