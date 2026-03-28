import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

import { createStatefulSetTemplate } from './templates';
import { ResourceFormProps } from 'shared/ResourceForm/components/ResourceForm';

type StatefulSetCreateProps = {
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

export default function StatefulSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resource: initialStatefulSet,
  resourceUrl,
  ...props
}: StatefulSetCreateProps) {
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [statefulSet, setStatefulSet] = useState(
    cloneDeep(initialStatefulSet) || createStatefulSetTemplate(namespaceId),
  );

  const [initialResource, setInitialResource] = useState(
    initialStatefulSet || createStatefulSetTemplate(namespaceId),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStatefulSet(
        cloneDeep(initialStatefulSet) || createStatefulSetTemplate(namespaceId),
      );
      setInitialResource(
        initialStatefulSet || createStatefulSetTemplate(namespaceId),
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialStatefulSet, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="statefulsets"
      singularName={t('stateful-sets.name_singular')}
      resource={statefulSet}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setStatefulSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
