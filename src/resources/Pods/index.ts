import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';

import { matchByOwnerReference, matchBySelector } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';

function matchByMount(volumeResourceType: any) {
  const valueFromKey = volumeResourceType + 'KeyRef';

  return (pod: any, resource: any) => {
    const connectedResourceName = resource.metadata.name;
    const connectedByEnv = pod.spec.containers.some((container: any) =>
      container.env.find(
        (e: any) => e.valueFrom?.[valueFromKey]?.name === connectedResourceName,
      ),
    );
    const connectedByVolume = pod.spec.volumes.some(
      (volume: any) =>
        volume[volumeResourceType]?.name === connectedResourceName,
    );
    return connectedByEnv || connectedByVolume;
  };
}

function matchByVolumes(pod: any, resource: any) {
  return pod.spec.volumes.some(
    (volume: any) => volume.secret?.secretName === resource.metadata.name,
  );
}

export const resourceType = 'Pods';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const List = React.lazy(() => import('./PodList'));
export const Details = React.lazy(() => import('./PodDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: 0,
  relations: [
    {
      resource: { kind: 'ConfigMap' },
      filter: (pod, cm) => matchByMount('configMap')(pod, cm),
    },
    {
      resource: { kind: 'DaemonSet' },
      filter: (pod, ds) =>
        matchByOwnerReference({
          resource: pod,
          owner: ds,
        }),
    },
    {
      resource: { kind: 'Job' },
      filter: (pod, job) =>
        matchByOwnerReference({
          resource: pod,
          owner: job,
        }),
    },
    {
      resource: { kind: 'ReplicaSet' },
      filter: (pod, replicaSet) =>
        matchBySelector(
          replicaSet.spec.selector.matchLabels,
          pod.metadata.labels,
        ) ||
        matchByOwnerReference({
          resource: pod,
          owner: replicaSet,
        }),
    },
    {
      resource: { kind: 'Secret' },
      filter: (pod, secret) =>
        matchByMount('secret')(pod, secret) || matchByVolumes(pod, secret),
    },
    {
      resource: { kind: 'StatefulSet' },
      filter: (pod, ss) =>
        matchByOwnerReference({
          resource: pod,
          owner: ss,
        }),
    },
    {
      resource: { kind: 'PersistentVolumeClaim' },
      filter: (pod, pvc) =>
        pod.spec.volumes.some(
          (volume: any) =>
            volume.persistentVolumeClaim?.claimName === pvc.metadata.name,
        ),
    },
  ],
});
