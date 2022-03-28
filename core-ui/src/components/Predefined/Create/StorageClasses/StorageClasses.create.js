import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createStorageClassTemplate } from './templates';

function StorageClassesCreate({
  onChange,
  formElementRef,
  resourceUrl,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [storageClass, setStorageClass] = useState(
    createStorageClassTemplate(),
  );

  return (
    <ResourceForm
      pluralKind="storageclass"
      singularName={t('storage-classes.name_singular')}
      resource={storageClass}
      setResource={setStorageClass}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    ></ResourceForm>
  );
}

StorageClassesCreate.resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'PersistentVolume',
      clusterwide: true,
    },
    {
      kind: 'PersistentVolumeClaim',
      clusterwide: true,
    },
    {
      kind: 'Secret',
      clusterwide: true,
    },
  ],
  networkFlowLevel: 2,
  matchers: {
    Secret: (sc, secret) => sc.parameters?.secretName === secret.metadata.name,
  },
  depth: 1,
});

export { StorageClassesCreate };
