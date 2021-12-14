import React from 'react';
import { useTranslation } from 'react-i18next';
import { Rules } from './Rules';
import { DefaultBackendPanel } from './DefaultBackendPanel';

export const IngressesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const getLoadBalancer = ingress => {
    if (ingress.status.loadBalancer?.ingress) {
      return ingress.status.loadBalancer?.ingress
        .map(endpoint => endpoint.ip || endpoint.hostname)
        .join(', ');
    } else {
      return '-';
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
      <DefaultBackendPanel backend={resource.spec.defaultBackend} />
    ) : null,
  );
  customComponents.push(resource =>
    resource.spec.rules ? <Rules rules={resource.spec.rules} /> : null,
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={customComponents}
      {...otherParams}
    />
  );
};
