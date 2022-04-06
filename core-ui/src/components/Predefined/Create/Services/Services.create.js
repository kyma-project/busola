import React, { useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { matchByOwnerReference } from 'shared/utils/helpers';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createServiceTemplate } from './templates';

function ServicesCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [service, setService] = useState(createServiceTemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="services"
      singularName={t('services.name_singular')}
      resource={service}
      setResource={setService}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
      onlyYaml
    />
  );
}
ServicesCreate.resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Deployment',
    },
    {
      kind: 'APIRule',
    },
    {
      kind: 'Function',
    },
    {
      kind: 'Subscription',
    },
    {
      kind: 'Ingress',
    },
    {
      kind: 'VirtualService',
    },
  ],
  matchers: {
    Function: (service, functión) =>
      matchByOwnerReference({
        resource: service,
        owner: functión,
      }),
  },
});
export { ServicesCreate };
