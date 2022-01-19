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

export { PersistentVolumeClaimsCreate };
