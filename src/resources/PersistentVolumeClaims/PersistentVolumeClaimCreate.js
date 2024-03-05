import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as _ from 'lodash';
import { ResourceForm } from 'shared/ResourceForm';

import { createPersistentVolumeClaimTemplate } from './templates';

export default function PersistentVolumeClaimCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
  resource: initialPersistentVolumeClaim,
  setCustomValid,
  ...props
}) {
  const { t } = useTranslation();
  const [persistentVolumeClaim, setPersistentVolumeClaim] = useState(
    _.cloneDeep(initialPersistentVolumeClaim) ||
      createPersistentVolumeClaimTemplate(namespace),
  );

  return (
    <ResourceForm
      {...props}
      pluralKind="persistentvolumeclaims"
      singularName={t('persistent-volume-claims.name_singular')}
      resource={persistentVolumeClaim}
      initialResource={initialPersistentVolumeClaim}
      setResource={setPersistentVolumeClaim}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
