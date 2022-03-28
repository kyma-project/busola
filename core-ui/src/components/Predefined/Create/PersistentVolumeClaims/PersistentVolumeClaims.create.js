import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createPersistentVolumeClaimsTemplate } from './templates';

function PersistentVolumeClaimsCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [persistentVolumeClaim, setPersistentVolumeClaim] = useState(
    createPersistentVolumeClaimsTemplate(namespace),
  );

  return (
    <ResourceForm
      pluralKind="persistentvolumeclaims"
      singularName={t('persistent-volume-claims.name_singular')}
      resource={persistentVolumeClaim}
      setResource={setPersistentVolumeClaim}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}

PersistentVolumeClaimsCreate.resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'Pod',
    },
    {
      kind: 'StorageClass',
    },
    {
      kind: 'PersistentVolume',
      clusterwide: true,
    },
  ],
  depth: 1,
  networkFlowLevel: 1,
  matchers: {
    StorageClass: (pvc, sc) => pvc.spec.storageClassName === sc.metadata.name,
    PersistentVolume: (pvc, pv) => (pvc.spec.volumeName = pv.metadata.name),
  },
});

export { PersistentVolumeClaimsCreate };
