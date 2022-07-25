import React from 'react';

import { matchByOwnerReference, matchBySelector } from 'shared/utils/helpers';

function matchByMount(volumeResourceType) {
  const valueFromKey = volumeResourceType + 'KeyRef';

  return (pod, resource) => {
    const connectedResourceName = resource.metadata.name;
    const connectedByEnv = pod.spec.containers.some(container =>
      container.env.find(
        e => e.valueFrom?.[valueFromKey]?.name === connectedResourceName,
      ),
    );
    const connectedByVolume = pod.spec.volumes.some(
      volume => volume[volumeResourceType]?.name === connectedResourceName,
    );
    return connectedByEnv || connectedByVolume;
  };
}

function matchByVolumes(pod, resource) {
  return pod.spec.volumes.some(
    volume => volume.secret?.secretName === resource.metadata.name,
  );
}

export const resourceType = 'Pods';
export const namespaced = true;

export const List = React.lazy(() => import('./PodList'));
export const Details = React.lazy(() => import('./PodDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: 0,
  relations: [
    {
      kind: 'ConfigMap',
    },
    {
      kind: 'DaemonSet',
    },
    {
      kind: 'Job',
    },
    {
      kind: 'ReplicaSet',
    },
    {
      kind: 'Secret',
    },
    {
      kind: 'StatefulSet',
    },
    {
      kind: 'PersistentVolumeClaim',
    },
    {
      kind: 'NetworkPolicy',
    },
  ],
  matchers: {
    ConfigMap: (pod, cm) => matchByMount('configMap')(pod, cm),
    DaemonSet: (pod, ds) =>
      matchByOwnerReference({
        resource: pod,
        owner: ds,
      }),
    Job: (pod, job) =>
      matchByOwnerReference({
        resource: pod,
        owner: job,
      }),
    ReplicaSet: (pod, replicaSet) =>
      matchBySelector(
        replicaSet.spec.selector.matchLabels,
        pod.metadata.labels,
      ),
    Secret: (pod, secret) =>
      matchByMount('secret')(pod, secret) || matchByVolumes(pod, secret),
    StatefulSet: (pod, ss) =>
      matchByOwnerReference({
        resource: pod,
        owner: ss,
      }),
    PersistentVolumeClaim: (pod, pvc) =>
      pod.spec.volumes.some(
        volume => volume.persistentVolumeClaim?.claimName === pvc.metadata.name,
      ),
  },
});
