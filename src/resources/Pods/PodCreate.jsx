import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import * as _ from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

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

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [pod, setPod] = useState(
    _.cloneDeep(initialPod) || createPodTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(
    initialPod || createPodTemplate(namespaceId),
  );

  useEffect(() => {
    setPod(_.cloneDeep(initialPod) || createPodTemplate(namespaceId));
    setInitialResource(initialPod || createPodTemplate(namespaceId));
  }, [initialPod, namespaceId]);

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
