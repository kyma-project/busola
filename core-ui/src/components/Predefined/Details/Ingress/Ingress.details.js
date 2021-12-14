import React from 'react';
import { useTranslation } from 'react-i18next';
import { Rules } from './Rules';
import { DefaultBackendPanel } from './DefaultBackendPanel';

export const IngressesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const getLoadBalancer = service => {
    if (service.status.loadBalancer?.ingress) {
      return service.status.loadBalancer?.ingress
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
  ];

  const customComponents = [];

  customComponents.push(resource =>
    resource.spec.defaultBackend ? (
      <DefaultBackendPanel backend={resource.spec.defaultBackend} />
    ) : null,
  );
  customComponents.push(resource => <Rules rules={resource.spec.rules} />);

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={customComponents}
      {...otherParams}
    />
  );
};
