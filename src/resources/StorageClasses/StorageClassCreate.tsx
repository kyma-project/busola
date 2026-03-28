import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';
import { ResourceForm } from 'shared/ResourceForm';
import { createStorageClassTemplate } from './templates';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type StorageClassCreateProps = {
  resourceUrl: string;
} & Omit<
  ResourceFormProps,
  | 'pluralKind'
  | 'singularName'
  | 'initialResource'
  | 'setResource'
  | 'updateInitialResource'
  | 'createUrl'
  | 'onlyYaml'
>;

export default function StorageClassCreate({
  onChange,
  formElementRef,
  resourceUrl,
  resource: initialStorageClass,
  setCustomValid,
  ...props
}: StorageClassCreateProps) {
  const { t } = useTranslation();

  const [storageClass, setStorageClass] = useState(
    cloneDeep(initialStorageClass) || createStorageClassTemplate(),
  );

  const [initialResource, setInitialResource] = useState(
    initialStorageClass || createStorageClassTemplate(),
  );

  const [prevInitialStorageClass, setPrevInitialStorageClass] =
    useState(initialStorageClass);

  if (initialStorageClass !== prevInitialStorageClass) {
    setPrevInitialStorageClass(initialStorageClass);
    setStorageClass(
      cloneDeep(initialStorageClass) || createStorageClassTemplate(),
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
