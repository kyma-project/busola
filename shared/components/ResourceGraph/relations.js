function selectorMatches(originalSelector, selector) {
  for (const [key, value] of Object.entries(originalSelector)) {
    if (selector?.[key] !== value) {
      return false;
    }
  }
  return true;
}

export const relations = {
  ClusterRole: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
      selectBy: (clusterRole, crbs) =>
        crbs.filter(
          crb =>
            crb.roleRef.kind === 'ClusterRole' &&
            crb.roleRef.name === clusterRole.metadata.name,
        ),
    },
  ],
  ClusterRoleBinding: [
    {
      kind: 'ClusterRole',
      namespaced: false,
      selectBy: (crb, clusterRoles) =>
        clusterRoles.filter(
          clusterRole =>
            crb.roleRef.kind === 'ClusterRole' &&
            crb.roleRef.name === clusterRole.metadata.name,
        ),
    },
    {
      kind: 'ServiceAccount',
      selectBy: (crb, serviceAccounts) =>
        serviceAccounts.filter(sa =>
          crb.subjects.find(
            sub =>
              sub.kind === 'ServiceAccount' &&
              sub.name === sa.metadata.name &&
              sub.namespace === sa.metadata.namespace,
          ),
        ),
    },
  ],
  Deployment: [
    {
      kind: 'Pod',
      selectBy: (deployment, pods) =>
        pods.filter(pod =>
          selectorMatches(
            deployment.spec.selector.matchLabels,
            pod.metadata.labels,
          ),
        ),
    },
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposed-by',
      selectBy: (deployment, services) =>
        services.filter(service =>
          selectorMatches(
            deployment.spec.selector.matchLabels,
            service.spec.selector,
          ),
        ),
    },
    {
      kind: 'HorizontalPodAutoscaler',
      selectBy: (deployment, hpas) =>
        hpas.filter(
          hpa =>
            hpa.spec.scaleTargetRef.kind === 'Deployment' &&
            hpa.spec.scaleTargetRef.name === deployment.metadata.name,
        ),
    },
  ],
  Pod: [
    {
      kind: 'Deployment',
      selectBy: (pod, deployments) =>
        deployments.filter(deployment =>
          selectorMatches(
            deployment.spec.selector.matchLabels,
            pod.metadata.labels,
          ),
        ),
    },
    {
      kind: 'Secret',
      selectBy: (pod, secrets) =>
        secrets.filter(secret =>
          pod.spec.containers.some(container =>
            container.env.find(
              e => e.valueFrom?.secretKeyRef?.name === secret.metadata.name,
            ),
          ),
        ),
    },
    {
      kind: 'ConfigMap',
      selectBy: (pod, configMaps) =>
        configMaps.filter(configMap =>
          pod.spec.containers.some(container =>
            container.env.find(
              e =>
                e.valueFrom?.configMapKeyRef?.name === configMap.metadata.name,
            ),
          ),
        ),
    },
  ],
  Service: [
    {
      kind: 'Deployment',
      labelKey: 'resource-graph.relations.exposes',
      selectBy: (service, deployments) =>
        deployments.filter(deployment =>
          selectorMatches(
            service.spec.selector,
            deployment.spec.selector.matchLabels,
          ),
        ),
    },
    {
      kind: 'APIRule',
      labelKey: 'resource-graph.relations.exposed-by',
      selectBy: (service, apiRules) =>
        apiRules.filter(
          apiRule => apiRule.spec.service.name === service.metadata.name,
        ),
    },
    {
      kind: 'Function',
      selectBy: (service, functions) =>
        functions.filter(f =>
          service.metadata.ownerReferences?.some(
            oR => oR.kind === 'Function' && oR.name === f.metadata.name,
          ),
        ),
    },
  ],
  ServiceAccount: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
      selectBy: (sa, crbs) =>
        crbs.filter(crb =>
          crb.subjects?.find(
            sub =>
              sub.kind === 'ServiceAccount' &&
              sub.name === sa.metadata.name &&
              sub.namespace === sa.metadata.namespace,
          ),
        ),
    },
  ],
  APIRule: [
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposes',
      selectBy: (apiRule, services) =>
        services.filter(svc => apiRule.spec.service.name === svc.metadata.name),
    },
  ],
  Function: [
    {
      kind: 'Service',
      selectBy: (functión, services) =>
        services.filter(svc =>
          svc.metadata.ownerReferences?.some(
            oR => oR.kind === 'Function' && oR.name === functión.metadata.name,
          ),
        ),
    },
  ],
  HorizontalPodAutoscaler: [
    {
      kind: 'Deployment',
      selectBy: (hpa, deployments) =>
        deployments.filter(
          deployment =>
            hpa.spec.scaleTargetRef.kind === 'Deployment' &&
            hpa.spec.scaleTargetRef.name === deployment.metadata.name,
        ),
    },
  ],
  Secret: [
    {
      kind: 'Pod',
      selectBy: (secret, pods) =>
        pods.filter(pod =>
          pod.spec.containers.some(container =>
            container.env.find(
              e => e.valueFrom?.secretKeyRef?.name === secret.metadata.name,
            ),
          ),
        ),
    },
  ],
  ConfigMap: [
    {
      kind: 'Pod',
      selectBy: (configMap, pods) =>
        pods.filter(pod =>
          pod.spec.containers.some(container =>
            container.env.find(
              e =>
                e.valueFrom?.configMapKeyRef?.name === configMap.metadata.name,
            ),
          ),
        ),
    },
  ],
};
