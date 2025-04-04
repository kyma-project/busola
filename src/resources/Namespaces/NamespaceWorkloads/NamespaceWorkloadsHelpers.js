import { calculatePodState } from 'resources/Pods/PodStatus';

export function getHealthyReplicasCount(resource) {
  return resource?.filter(r => {
    const running = r.status.readyReplicas || 0;
    const expected = r.status.replicas || r.spec.replicas || 0;

    return running === expected;
  })?.length;
}

export const PodStatusCounterKey = {
  Pending: 'pending',
  Healthy: 'healthy',
  Failed: 'failed',
};

export function getStatusesPodCount(pods) {
  if (!pods) {
    return new Map();
  }
  const statusData = Map.groupBy(pods, pod => {
    const podState = calculatePodState(pod);
    return getPodState(podState.status);
  });

  statusData.forEach((value, key, map) => map.set(key, value.length));
  return statusData;
}

function getPodState(status) {
  switch (status) {
    case 'Running':
    case 'Succeeded':
    case 'Completed':
    case 'Terminated':
      return 'healthy';
    case 'Pending':
    case 'Terminating':
    case 'PodInitializing':
    case 'ContainerCreating':
    case 'Unknown':
      return 'pending';
    default:
      return 'failed';
  }
}

export function getHealthyStatusesCount(pods) {
  const successStatuses = ['running', 'succeeded'];
  return pods?.filter(p =>
    successStatuses.includes(p.status.phase.toLowerCase()),
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

export function getAvailableNvidiaGPUs(nodesData) {
  if (!nodesData) {
    return 0;
  }
  return nodesData
    .map(node => node.status.allocatable)
    .reduce((partialSum, item) => {
      const nvidiaGpus = item['nvidia.com/gpu'];
      if (nvidiaGpus) {
        const value = parseInt(nvidiaGpus);
        return partialSum + value;
      }
      return partialSum;
    }, 0);
}
