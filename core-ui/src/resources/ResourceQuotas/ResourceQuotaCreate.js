import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ResourceForm } from 'shared/ResourceForm';

import { createResourceQuotaTemplate } from './templates';

export function ResourceQuotaCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
  ...props
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [resourceQuota, setResourceQuota] = useState(
    createResourceQuotaTemplate({ namespaceName: namespaceId }),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
      {...props}
      pluralKind="resourceQuotas"
      singularName={t('resource-quotas.name_singular')}
      resource={resourceQuota}
      setResource={setResourceQuota}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
      afterCreatedFn={() => {}}
    />
  );
}
