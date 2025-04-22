import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';

import { createPodTemplate } from './templates';

export default function PodCreate({
  formElementRef,
  onChange,
  resource: initialPod,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();

  const namespaceId = useRecoilValue(activeNamespaceIdState);
  const [pod, setPod] = useState(
    _.cloneDeep(initialPod) || createPodTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(initialPod);

  useEffect(() => {
    setPod(_.cloneDeep(initialPod) || createPodTemplate(namespaceId));
  }, [initialPod, namespaceId]);

  useEffect(() => {
    setInitialResource(initialPod);
  }, [initialPod]);

  return (
    <ResourceForm
      {...props}
      pluralKind="pods"
      singularName={t('pods.name_singular')}
      resource={pod}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setPod}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
