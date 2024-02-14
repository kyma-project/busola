import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Link } from 'shared/components/Link/Link';

import { IngressCreate } from './IngressCreate';
import { description } from './IngressDescription';

export function IngressList(props) {
  const { t } = useTranslation();

  const getLoadBalancer = service => {
    if (service.status.loadBalancer?.ingress) {
      return service.status.loadBalancer?.ingress
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
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={IngressCreate}
      emptyListProps={{
        subtitleText: t('ingresses.description'),
        url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',
      }}
    />
  );
}

export default IngressList;
