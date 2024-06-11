export function getHealthyReplicasCount(resource) {
  return resource?.filter(r => r.status.replicas === r.status.readyReplicas)
    ?.length;
}

export function getHealthyStatusesCount(pods) {
  const successStatuses = ['RUNNING', 'SUCCEEDED'];
  return pods?.filter(p =>
    successStatuses.includes(p.status.phase.toUpperCase()),
  )?.length;
}

export function getHealthyDaemonsets(daemonsets) {
  return daemonsets?.filter(
    ds =>
      ds.status.currentNumberScheduled === ds.status.desiredNumberScheduled &&
      ds.status.desiredNumberScheduled === ds.status.numberAvailable &&
      ds.status.numberAvailable === ds.status.numberReady &&
      ds.status.numberReady === ds.status.updatedNumberScheduled &&
      ds.status.numberMisscheduled === 0,
  )?.length;
}
