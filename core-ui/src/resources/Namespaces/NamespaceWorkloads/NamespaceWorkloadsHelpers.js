export function getHealthyReplicasCount(resource) {
  return resource.filter(r => r.status.replicas === r.status.readyReplicas)
    .length;
}

export function getHealthyStatusesCount(pods) {
  const successStatuses = ['RUNNING', 'SUCCEEDED'];
  return pods.filter(p =>
    successStatuses.includes(p.status.phase.toUpperCase()),
  ).length;
}
