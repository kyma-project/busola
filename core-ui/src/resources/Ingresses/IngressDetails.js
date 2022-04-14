import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import { Rules } from './Rules';
import { DefaultBackendPanel } from './DefaultBackendPanel';
import { IngressCreate } from './IngressCreate';

export function IngressDetails(props) {
  const { t } = useTranslation();

  const getLoadBalancer = ingress => {
    if (ingress.status.loadBalancer?.ingress) {
      return ingress.status.loadBalancer?.ingress
        .map(endpoint => endpoint.ip || endpoint.hostname)
        .join(', ');
    } else {
      return EMPTY_TEXT_PLACEHOLDER;
    }
  };

  const customColumns = [
    {
      header: t('ingresses.labels.load-balancers'),
      value: getLoadBalancer,
    },
    {
      header: t('ingresses.labels.ingress-class-name'),
      value: ingress => ingress.spec.ingressClassName,
    },
  ];

  const customComponents = [];

  customComponents.push(resource =>
    resource.spec.defaultBackend ? (
      <DefaultBackendPanel
        backend={resource.spec.defaultBackend}
        namespace={resource.metadata.namespace}
      />
    ) : null,
  );
  customComponents.push(resource =>
    resource.spec.rules ? <Rules rules={resource.spec.rules} /> : null,
  );

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      createResourceForm={IngressCreate}
      {...props}
    />
  );
}

export default IngressDetails;
