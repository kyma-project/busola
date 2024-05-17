import React, { useState } from 'react';
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
  const [pv, setPv] = useState(
    _.cloneDeep(initialPersistentVolume) || createPersistentVolumeTemplate(),
  );
  const { t } = useTranslation();

  if (!initialPersistentVolume) {
    initialPersistentVolume = createPersistentVolumeTemplate();
  }

  return (
    <ResourceForm
      {...props}
      pluralKind="persistentvolumes"
      singularName={t('pv.name_singular')}
      resource={pv}
      initialResource={initialPersistentVolume}
      setResource={setPv}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
