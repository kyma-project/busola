import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createPersistentVolumeTemplate } from './templates';

function PersistentVolumesCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const [pv, setPv] = useState(createPersistentVolumeTemplate());
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="persistentvolumes"
      singularName={t('pv.name_singular')}
      resource={pv}
      setResource={setPv}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
export { PersistentVolumesCreate };
