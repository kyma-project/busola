function selectorMatches(originalSelector, selector) {
  for (const [key, value] of Object.entries(originalSelector)) {
    if (selector?.[key] !== value) {
      return false;
    }
  }
  return true;
}

function matchClusterRoleAndClusterRoleBinding(cr, crb) {
  return (
    crb.roleRef.kind === 'ClusterRole' && crb.roleRef.name === cr.metadata.name
  );
}

function matchClusterRoleBindingAndServiceAccount(crb, sa) {
  return crb.subjects.find(
    sub =>
      sub.kind === 'ServiceAccount' &&
      sub.name === sa.metadata.name &&
      sub.namespace === sa.metadata.namespace,
  );
}

function matchSecretAndServiceAccount(secret, sa) {
  return (
    sa.secrets.find(s => s.name === secret.metadata.name) ||
    sa.imagePullSecrets.find(s => s.name === secret.metadata.name)
  );
}

function matchPodAndConfigmap(pod, cm) {
  return pod.spec.containers.some(container =>
    container.env.find(
      e => e.valueFrom?.configMapKeyRef?.name === cm.metadata.name,
    ),
  );
}

function matchPodAndSecret(pod, secret) {
  return pod.spec.containers.some(container =>
    container.env.find(
      e => e.valueFrom?.secretKeyRef?.name === secret.metadata.name,
    ),
  );
}

function matchDeploymentAndHPA(deployment, hpa) {
  return (
    hpa.spec.scaleTargetRef.kind === 'Deployment' &&
    hpa.spec.scaleTargetRef.name === deployment.metadata.name
  );
}

function matchDeploymentAndService(deployment, service) {
  return selectorMatches(
    deployment.spec.selector.matchLabels,
    service.spec.selector,
  );
}

function matchAPIRuleAndService(apiRule, service) {
  return apiRule.spec.service.name === service.metadata.name;
}

function matchServiceAndFunction(service, functión) {
  return service.metadata.ownerReferences?.some(
    oR => oR.kind === 'Function' && oR.name === functión.metadata.name,
  );
}

function matchPodAndDeployment(pod, deployment) {
  return selectorMatches(
    deployment.spec.selector.matchLabels,
    pod.metadata.labels,
  );
}

export const relations = {
  ClusterRole: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
      selectBy: (cr, crbs) =>
        crbs.filter(crb => matchClusterRoleAndClusterRoleBinding(cr, crb)),
    },
  ],
  ClusterRoleBinding: [
    {
      kind: 'ClusterRole',
      namespaced: false,
      selectBy: (crb, clusterRoles) =>
        clusterRoles.filter(cr =>
          matchClusterRoleAndClusterRoleBinding(cr, crb),
        ),
    },
    {
      kind: 'ServiceAccount',
      selectBy: (crb, serviceAccounts) =>
        serviceAccounts.filter(sa =>
          matchClusterRoleBindingAndServiceAccount(crb, sa),
        ),
    },
  ],
  Deployment: [
    {
      kind: 'Pod',
      selectBy: (deployment, pods) =>
        pods.filter(pod => matchPodAndDeployment(pod, deployment)),
    },
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposed-by',
      selectBy: (deployment, services) =>
        services.filter(service =>
          matchDeploymentAndService(deployment, service),
        ),
    },
    {
      kind: 'HorizontalPodAutoscaler',
      selectBy: (deployment, hpas) =>
        hpas.filter(hpa => matchDeploymentAndHPA(deployment, hpa)),
    },
  ],
  Pod: [
    {
      kind: 'Deployment',
      selectBy: (pod, deployments) =>
        deployments.filter(deployment =>
          matchPodAndDeployment(pod, deployment),
        ),
    },
    {
      kind: 'Secret',
      selectBy: (pod, secrets) =>
        secrets.filter(secret => matchPodAndSecret(pod, secret)),
    },
    {
      kind: 'ConfigMap',
      selectBy: (pod, configMaps) =>
        configMaps.filter(cm => matchPodAndConfigmap(pod, cm)),
    },
  ],
  Service: [
    {
      kind: 'Deployment',
      labelKey: 'resource-graph.relations.exposes',
      selectBy: (service, deployments) =>
        deployments.filter(deployment =>
          matchDeploymentAndService(deployment, service),
        ),
    },
    {
      kind: 'APIRule',
      labelKey: 'resource-graph.relations.exposed-by',
      selectBy: (service, apiRules) =>
        apiRules.filter(apiRule => matchAPIRuleAndService(apiRule, service)),
    },
    {
      kind: 'Function',
      selectBy: (service, functions) =>
        functions.filter(f => matchServiceAndFunction(service, f)),
    },
  ],
  ServiceAccount: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
      selectBy: (sa, crbs) =>
        crbs.filter(crb => matchClusterRoleBindingAndServiceAccount(crb, sa)),
    },
    {
      kind: 'Secret',
      selectBy: (sa, secrets) =>
        secrets.filter(secret => matchSecretAndServiceAccount(secret, sa)),
    },
  ],
  APIRule: [
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposes',
      selectBy: (apiRule, services) =>
        services.filter(service => matchAPIRuleAndService(apiRule, service)),
    },
  ],
  Function: [
    {
      kind: 'Service',
      selectBy: (functión, services) =>
        services.filter(service => matchServiceAndFunction(functión, service)),
    },
  ],
  HorizontalPodAutoscaler: [
    {
      kind: 'Deployment',
      selectBy: (hpa, deployments) =>
        deployments.filter(deployment =>
          matchDeploymentAndHPA(hpa, deployment),
        ),
    },
  ],
  Secret: [
    {
      kind: 'Pod',
      selectBy: (secret, pods) =>
        pods.filter(pod => matchPodAndSecret(pod, secret)),
    },
    {
      kind: 'ServiceAccount',
      selectBy: (secret, serviceAccounts) =>
        serviceAccounts.filter(sa => matchSecretAndServiceAccount(secret, sa)),
    },
  ],
  ConfigMap: [
    {
      kind: 'Pod',
      selectBy: (cm, pods) => pods.filter(pod => matchPodAndConfigmap(cm, pod)),
    },
  ],
};
