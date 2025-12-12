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

  const [initialResource, setInitialResource] = useState(
    initialStorageClass || createStorageClassTemplate(),
  );

  const [prevInitialStorageClass, setPrevInitialStorageClass] =
    useState(initialStorageClass);

  if (initialStorageClass !== prevInitialStorageClass) {
    setPrevInitialStorageClass(initialStorageClass);
    setStorageClass(
      _.cloneDeep(initialStorageClass) || createStorageClassTemplate(),
    );
    setInitialResource(initialStorageClass || createStorageClassTemplate());
  }

  return (
    <ResourceForm
      {...props}
      pluralKind="storageclasses"
      singularName={t('storage-classes.name_singular')}
      resource={storageClass}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setStorageClass}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    ></ResourceForm>
  );
}
