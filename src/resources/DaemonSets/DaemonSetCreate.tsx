import { RefObject, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { cloneDeep } from 'lodash';

import { createDaemonSetTemplate } from './templates';

type DaemonSetCreateProps = {
  formElementRef?: RefObject<HTMLFormElement | null>;
  onChange?: (job: Record<string, any>) => void;
  setCustomValid?: (isValid: boolean) => void;
  resource?: Record<string, any>;
  resourceUrl?: string;
  [key: string]: any;
};

export default function DaemonSetCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialDaemonSet,
  ...props
}: DaemonSetCreateProps) {
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [daemonSet, setDaemonSet] = useState(
    cloneDeep(initialDaemonSet) || createDaemonSetTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(
    initialDaemonSet || createDaemonSetTemplate(namespaceId),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDaemonSet(
        cloneDeep(initialDaemonSet) || createDaemonSetTemplate(namespaceId),
      );
      setInitialResource(
        initialDaemonSet || createDaemonSetTemplate(namespaceId),
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialDaemonSet, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="daemonsets"
      singularName={t('daemon-sets.name_singular')}
      resource={daemonSet}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setDaemonSet}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
