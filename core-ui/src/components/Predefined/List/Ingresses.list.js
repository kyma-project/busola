import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const IngressesList = ({ DefaultRenderer, ...otherParams }) => {
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

  const description = (
    <Trans i18nKey="ingresses.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/services-networking/ingress/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
