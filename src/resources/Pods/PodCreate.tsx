import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

import { createPodTemplate } from './templates';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type PodCreateProps = ResourceFormProps & {
  resourceUrl: string;
};

export default function PodCreate({
  formElementRef,
  onChange,
  resource: initialPod,
  setCustomValid,
  resourceUrl,
  ...props
}: PodCreateProps) {
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [pod, setPod] = useState(
    cloneDeep(initialPod) || createPodTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(
    initialPod || createPodTemplate(namespaceId),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPod(cloneDeep(initialPod) || createPodTemplate(namespaceId));
      setInitialResource(initialPod || createPodTemplate(namespaceId));
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
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
