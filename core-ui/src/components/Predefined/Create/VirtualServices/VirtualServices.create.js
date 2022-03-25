import React, { useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import { createTemplate } from './templates';

export function VirtualServicesCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { namespaceId } = useMicrofrontendContext();
  const [service, setService] = useState(createTemplate(namespaceId));
  const { t } = useTranslation();

  return (
    <ResourceForm
      pluralKind="virtualservices"
      singularName={t('virtualservices.name_singular')}
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
VirtualServicesCreate.resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -3,
  relations: [
    {
      kind: 'APIRule',
    },
    {
      kind: 'Gateway',
      clusterwide: true,
    },
    {
      kind: 'Service',
    },
  ],
  matchers: {
    Gateway: (vs, gateway) =>
      vs.spec.gateways.some(g => {
        const [name, namespace] = g.split('.');
        return (
          name === gateway.metadata.name &&
          namespace === gateway.metadata.namespace
        );
      }),
    Service: (vs, service) =>
      vs.spec.http.some(h =>
        h.route.some(r => {
          const [name, namespace] = r.destination?.host.split('.');
          return (
            name === service.metadata.name &&
            namespace === service.metadata.namespace
          );
        }),
      ),
  },
});
