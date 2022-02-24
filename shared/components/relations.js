function selectorMatches(originalSelector, selector) {
  for (const [key, value] of Object.entries(originalSelector)) {
    if (selector?.[key] !== value) {
      return false;
    }
  }
  return true;
}

const relations2 = {
  'Pod/Deployment': {
    firstBySecond: (pods, deployment) => pods,
    secondByFirst: (deployments, pod) => deployments,
  },
  'Service/Deployment': {
    firstBySecond: (services, deployment) => services,
    secondByFirst: (deployments, service) => deployments,
  },
  'Pod/Secret': {
    firstBySecond: (pods, secret) => pods,
    secondByFirst: (secrets, service) => secrets,
  },
};

///features?.API_GATEWAY?.isEnabled
export const relations = {
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
      label: 'Exposed by',
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
      label: 'Exposes',
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
      label: 'Exposed by',
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
  APIRule: [
    {
      kind: 'Service',
      label: 'Exposes',
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
    // {
    //   kind: 'Secret',
    //   selectBy: (functión, secrets) =>
    //     secrets.filter(secret =>
    //       functión.spec.env.find(
    //         e => e.valueFrom?.secretKeyRef?.name === secret.metadata.name,
    //       ),
    //     ),
    // },
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
    // {
    //   kind: 'Function',
    //   selectBy: (secret, functions) =>
    //     functions.filter(f =>
    //       f.spec.env.find(
    //         e => e.valueFrom?.secretKeyRef?.name === secret.metadata.name,
    //       ),
    //     ),
    // },
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
