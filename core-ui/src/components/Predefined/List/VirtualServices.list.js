import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export function VirtualServicesList({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  // State | Name | Gateways | Hosts | Age - as a starting point
  const customColumns = [
    {
      header: t('virtualservices.hosts'),
      value: service => service.spec.hosts?.join(','),
    },
    {
      header: t('virtualservices.gateways'),
      value: service => service.spec.gateways?.join(','),
    },
  ];

  const description = (
    <Trans i18nKey="virtualservices.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/virtual-service/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      resourceName={t('virtualservices.title')}
      {...otherParams}
    />
  );
}
