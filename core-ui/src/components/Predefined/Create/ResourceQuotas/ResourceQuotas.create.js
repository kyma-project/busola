import React, { useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createResourceQuotaTemplate } from './templates';

function ResourceQuotasCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [resourceQuota, setResourceQuota] = useState(
    createResourceQuotaTemplate({ namespaceName: namespaceId }),
  );
  const { t } = useTranslation();

  return (
    <ResourceForm
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
export { ResourceQuotasCreate };
