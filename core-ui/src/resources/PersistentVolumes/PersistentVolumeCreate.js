import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';

import { createPersistentVolumeTemplate } from './templates';

export function PersistentVolumeCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const [pv, setPv] = useState(createPersistentVolumeTemplate());
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
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
