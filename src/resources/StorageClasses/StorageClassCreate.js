import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm';

import { createStorageClassTemplate } from './templates';

export default function StorageClassCreate({
  onChange,
  formElementRef,
  resourceUrl,
  setCustomValid,
  ...props
}) {
  const { t } = useTranslation();
  const [storageClass, setStorageClass] = useState(
    createStorageClassTemplate(),
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="storageclasses"
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
