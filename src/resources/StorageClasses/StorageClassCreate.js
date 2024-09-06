import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { createStorageClassTemplate } from './templates';

export default function StorageClassCreate({
  onChange,
  formElementRef,
  resourceUrl,
  resource: initialStorageClass,
  setCustomValid,
  ...props
}) {
  const { t } = useTranslation();
  const [storageClass, setStorageClass] = useState(
    _.cloneDeep(initialStorageClass) || createStorageClassTemplate(),
  );
  const [initialResource] = useState(
    initialStorageClass || createStorageClassTemplate(),
  );
  const [initialUnchangedResource] = useState(_.cloneDeep(initialStorageClass));

  return (
    <ResourceForm
      {...props}
      pluralKind="storageclasses"
      singularName={t('storage-classes.name_singular')}
      resource={storageClass}
      initialResource={initialResource}
      initialUnchangedResource={initialUnchangedResource}
      setResource={setStorageClass}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    ></ResourceForm>
  );
}
