import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { GatewaySelector } from '../Details/Gateway/GatewaySelector';
import { Trans } from 'react-i18next';

export function GatewaysList({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('gateways.selector'),
      value: gateway => <GatewaySelector key="selector" gateway={gateway} />,
    },
  ];

  const description = (
    <Trans i18nKey="gateways.description">
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/gateway/"
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
}
