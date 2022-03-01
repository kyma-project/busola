function matchBySelector(originalSelector, selector) {
  if (!originalSelector || !selector) return false;
  for (const [key, value] of Object.entries(originalSelector)) {
    if (selector?.[key] !== value) {
      return false;
    }
  }
  return true;
}

function matchByOwnerReference({ resource, owner }) {
  return resource.metadata.ownerReferences?.some(
    oR => oR.kind === owner.kind && oR.name === owner.metadata.name,
  );
}

export function matchClusterRoleAndClusterRoleBinding(cr, crb) {
  return (
    crb.roleRef.kind === 'ClusterRole' && crb.roleRef.name === cr.metadata.name
  );
}

export function matchClusterRoleBindingAndServiceAccount(crb, sa) {
  return crb.subjects?.find(
    sub =>
      sub.kind === 'ServiceAccount' &&
      sub.name === sa.metadata.name &&
      sub.namespace === sa.metadata.namespace,
  );
}

export function matchRoleBindingAndServiceAccount(rb, sa) {
  return rb.subjects?.find(
    sub => sub.kind === 'ServiceAccount' && sub.name === sa.metadata.name,
  );
}

export function matchSecretAndServiceAccount(secret, sa) {
  return (
    sa.secrets?.find(s => s.name === secret.metadata.name) ||
    sa.imagePullSecrets?.find(s => s.name === secret.metadata.name)
  );
}

export function matchPodAndConfigMap(pod, cm) {
  return pod.spec.containers.some(container =>
    container.env.find(
      e => e.valueFrom?.configMapKeyRef?.name === cm.metadata.name,
    ),
  );
}

export function matchPodAndSecret(pod, secret) {
  return pod.spec.containers.some(container =>
    container.env?.find(
      e => e.valueFrom?.secretKeyRef?.name === secret.metadata.name,
    ),
  );
}

export function matchDeploymentAndHorizontalPodAutoscaler(deployment, hpa) {
  return (
    hpa.spec.scaleTargetRef?.kind === 'Deployment' &&
    hpa.spec.scaleTargetRef?.name === deployment.metadata.name
  );
}

export function matchSecretAndOAuth2Client(secret, client) {
  return client.spec.secretName === secret.metadata.name;
}

export function matchClusterRoleAndRoleBinding(cr, rb) {
  return (
    rb.roleRef.kind === 'ClusterRole' && rb.roleRef.name === cr.metadata.name
  );
}

export function matchRoleAndRoleBinding(cr, rb) {
  return rb.roleRef.kind === 'Role' && rb.roleRef.name === cr.metadata.name;
}

export function matchDeploymentAndService(deployment, service) {
  return matchBySelector(
    deployment.spec.selector.matchLabels,
    service.spec.selector,
  );
}

export function matchAPIRuleAndService(apiRule, service) {
  return apiRule.spec.service?.name === service.metadata.name;
}

export function matchServiceAndFunction(service, functión) {
  return matchByOwnerReference({
    resource: service,
    owner: functión,
  });
}

export function matchAPIRuleAndVirtualService(apiRule, virtualService) {
  return virtualService.spec.hosts.includes(apiRule.spec.service.host);
}

export function matchDeploymentAndReplicaSet(deployment, replicaSet) {
  return matchByOwnerReference({
    resource: replicaSet,
    owner: deployment,
  });
}

export function matchPodAndDeployment(pod, deployment) {
  return matchBySelector(
    deployment.spec.selector.matchLabels,
    pod.metadata.labels,
  );
}

export function matchAPIRuleAndGateway(apiRule, gateway) {
  const [name, namespace] = apiRule.spec.gateway.split('.');
  return (
    name === gateway.metadata.name && namespace === gateway.metadata.namespace
  );
}
