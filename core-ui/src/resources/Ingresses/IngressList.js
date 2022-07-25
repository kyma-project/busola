import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Link } from 'shared/components/Link/Link';

import { IngressCreate } from './IngressCreate';

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

  const description = (
    <Trans i18nKey="ingresses.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/services-networking/ingress/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      createResourceForm={IngressCreate}
      {...props}
    />
  );
}

export default IngressList;
