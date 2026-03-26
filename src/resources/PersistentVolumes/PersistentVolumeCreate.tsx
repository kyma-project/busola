import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { createPersistentVolumeTemplate } from './templates';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type PersistentVolumeCreateProps = ResourceFormProps & {
  resourceUrl: string;
};

export default function PersistentVolumeCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialPersistentVolume,
  ...props
}: PersistentVolumeCreateProps) {
  const { t } = useTranslation();

  const [pv, setPv] = useState(
    cloneDeep(initialPersistentVolume) || createPersistentVolumeTemplate(),
  );

  const [initialResource, setInitialResource] = useState(
    initialPersistentVolume || createPersistentVolumeTemplate(),
  );

  if (initialPersistentVolume && initialResource !== initialPersistentVolume) {
    setPv(
      cloneDeep(initialPersistentVolume) || createPersistentVolumeTemplate(),
    );
    setInitialResource(
      initialPersistentVolume || createPersistentVolumeTemplate(),
    );
  }

  return (
    <ResourceForm
      {...props}
      pluralKind="persistentvolumes"
      singularName={t('pv.name_singular')}
      resource={pv}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setPv}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
