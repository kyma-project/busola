import React, { useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { matchByOwnerReference, matchBySelector } from 'shared/utils/helpers';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createPodTemplate } from './templates';

function matchByEnv(valueFromKey) {
  return (pod, resource) =>
    pod.spec.containers.some(container =>
      container.env.find(
        e => e.valueFrom?.[valueFromKey]?.name === resource.metadata.name,
      ),
    );
}

function matchByVolumes(pod, resource) {
  return pod.spec.volumes.some(
    volume => volume.secret?.secretName === resource.metadata.name,
  );
}
function PodsCreate({ formElementRef, onChange, setCustomValid, resourceUrl }) {
  const { namespaceId } = useMicrofrontendContext();
  const [pod, setPod] = useState(createPodTemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="pods"
      singularName={t('pods.name_singular')}
      resource={pod}
      setResource={setPod}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}

PodsCreate.resourceGraphConfig = (t, context) => ({
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
    ConfigMap: (pod, cm) => matchByEnv('configMapKeyRef')(pod, cm),
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
      matchByEnv('secretKeyRef')(pod, secret) || matchByVolumes(pod, secret),
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
export { PodsCreate };
