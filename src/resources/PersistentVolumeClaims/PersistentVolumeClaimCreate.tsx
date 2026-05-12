import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cloneDeep } from 'lodash';
import { ResourceForm } from 'shared/ResourceForm';

import { createPersistentVolumeClaimTemplate } from './templates';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type PersistentVolumeClaimCreateProps = ResourceFormProps & {
  namespace?: string;
  resourceUrl?: string;
};

export default function PersistentVolumeClaimCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
  resource: initialPersistentVolumeClaim,
  setCustomValid,
  ...props
}: PersistentVolumeClaimCreateProps) {
  const { t } = useTranslation();
  const [persistentVolumeClaim, setPersistentVolumeClaim] = useState(
    cloneDeep(initialPersistentVolumeClaim) ||
      createPersistentVolumeClaimTemplate(namespace ?? 'default'),
  );

  const [initialResource, setInitialResource] = useState(
    initialPersistentVolumeClaim ||
      createPersistentVolumeClaimTemplate(namespace ?? 'default'),
  );
  const [prevNamespace, setPrevNamespace] = useState(namespace);

  if (
    (initialPersistentVolumeClaim &&
      initialPersistentVolumeClaim !== initialResource) ||
    namespace !== prevNamespace
  ) {
    setPrevNamespace(namespace);
    setPersistentVolumeClaim(
      cloneDeep(initialPersistentVolumeClaim) ||
        createPersistentVolumeClaimTemplate(namespace ?? 'default'),
    );
    setInitialResource(
      initialPersistentVolumeClaim ||
        createPersistentVolumeClaimTemplate(namespace ?? 'default'),
    );
  }

  return (
    <ResourceForm
      {...props}
      pluralKind="persistentvolumeclaims"
      singularName={t('persistent-volume-claims.name_singular')}
      resource={persistentVolumeClaim}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setPersistentVolumeClaim}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
