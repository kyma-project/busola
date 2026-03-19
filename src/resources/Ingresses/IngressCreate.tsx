import { useEffect, useState, FormEventHandler, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { createIngressTemplate } from './templates';
import { useAtomValue } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

interface IngressCreateProps {
  formElementRef: RefObject<HTMLFormElement>;
  onChange: FormEventHandler<HTMLElement>;
  setCustomValid: (valid: boolean) => void;
  resourceUrl: string;
  resource?: any;
  [key: string]: any;
}

export default function IngressCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialIngress,
  ...props
}: IngressCreateProps) {
  const { t } = useTranslation();

  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [ingress, setIngress] = useState(
    cloneDeep(initialIngress) || createIngressTemplate(namespaceId),
  );
  const [initialResource, setInitialResource] = useState(
    initialIngress || createIngressTemplate(namespaceId),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIngress(
        cloneDeep(initialIngress) || createIngressTemplate(namespaceId),
      );
      setInitialResource(initialIngress || createIngressTemplate(namespaceId));
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialIngress, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="ingresses"
      singularName={t('ingresses.name_singular')}
      resource={ingress}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setIngress}
      onlyYaml
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    />
  );
}
