import React, { useEffect, useState } from 'react';
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

  const [initialResource, setInitialResource] = useState(
    initialPersistentVolumeClaim ||
      createPersistentVolumeClaimTemplate(namespace),
  );

  useEffect(() => {
    setPersistentVolumeClaim(
      _.cloneDeep(initialPersistentVolumeClaim) ||
        createPersistentVolumeClaimTemplate(namespace),
    );
    setInitialResource(
      initialPersistentVolumeClaim ||
        createPersistentVolumeClaimTemplate(namespace),
    );
  }, [initialPersistentVolumeClaim, namespace]);

  return (
    <ResourceForm
      {...props}
      pluralKind="persistentvolumeclaims"
      singularName={t('persistent-volume-claims.name_singular')}
      resource={persistentVolumeClaim}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setPersistentVolumeClaim}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
