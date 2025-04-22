import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';

import { createPersistentVolumeTemplate } from './templates';

export default function PersistentVolumeCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialPersistentVolume,
  ...props
}) {
  const { t } = useTranslation();

  const [pv, setPv] = useState(
    _.cloneDeep(initialPersistentVolume) || createPersistentVolumeTemplate(),
  );

  const [initialResource, setInitialResource] = useState(
    initialPersistentVolume || createPersistentVolumeTemplate(),
  );

  useEffect(() => {
    setPv(
      _.cloneDeep(initialPersistentVolume) || createPersistentVolumeTemplate(),
    );
    setInitialResource(
      initialPersistentVolume || createPersistentVolumeTemplate(),
    );
  }, [initialPersistentVolume]);

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
