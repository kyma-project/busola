import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

import { createResourceQuotaTemplate } from './templates';

interface ResourceQuotaCreateProps {
  formElementRef: React.RefObject<HTMLFormElement>;
  onChange: () => void;
  setCustomValid: (valid: boolean) => void;
  resourceUrl: string;
  resource: any;
  [key: string]: any;
}

export default function ResourceQuotaCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  resource: initialResourceQuota,

  ...props
}: ResourceQuotaCreateProps) {
  const { t } = useTranslation();
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const [resourceQuota, setResourceQuota] = useState(
    cloneDeep(initialResourceQuota) ||
      createResourceQuotaTemplate({ namespaceName: namespaceId }),
  );
  const [initialResource, setInitialResource] = useState(
    initialResourceQuota ||
      createResourceQuotaTemplate({ namespaceName: namespaceId }),
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setResourceQuota(
        cloneDeep(initialResourceQuota) ||
          createResourceQuotaTemplate({ namespaceName: namespaceId }),
      );
      setInitialResource(
        initialResourceQuota ||
          createResourceQuotaTemplate({ namespaceName: namespaceId }),
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [initialResourceQuota, namespaceId]);

  return (
    <ResourceForm
      {...props}
      pluralKind="resourceQuotas"
      singularName={t('resource-quotas.name_singular')}
      resource={resourceQuota}
      initialResource={initialResource}
      updateInitialResource={setInitialResource}
      setResource={setResourceQuota}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
