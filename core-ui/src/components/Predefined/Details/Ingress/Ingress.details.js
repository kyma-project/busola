import React from 'react';
import { useTranslation } from 'react-i18next';
import Rules from './Rules';

import './Ingress.details.scss';

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

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[resource => <Rules rules={resource.spec.rules} />]}
      {...otherParams}
    />
  );
};
