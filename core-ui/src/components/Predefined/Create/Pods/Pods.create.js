import React, { useState } from 'react';
import { useMicrofrontendContext, matchBySelector } from 'react-shared';
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
  networkFlowLevel: 0,
  relations: [
    {
      kind: 'ReplicaSet',
    },
    {
      kind: 'Secret',
    },
    {
      kind: 'ConfigMap',
    },
    {
      kind: 'Job',
    },
    {
      kind: 'PersistentVolumeClaim',
    },
  ],
  matchers: {
    Job: (pod, job) =>
      matchBySelector(job.spec.selector.matchLabels, pod.metadata.labels),
    ConfigMap: (pod, cm) => matchByEnv('configMapKeyRef')(pod, cm),
    Secret: (pod, secret) =>
      matchByEnv('secretKeyRef')(pod, secret) || matchByVolumes(pod, secret),
    ReplicaSet: (pod, replicaSet) =>
      matchBySelector(
        replicaSet.spec.selector.matchLabels,
        pod.metadata.labels,
      ),
    PersistentVolumeClaim: (pod, pvc) =>
      pod.spec.volumes.some(
        volume => volume.persistentVolumeClaim?.claimName === pvc.metadata.name,
      ),
  },
});
export { PodsCreate };
