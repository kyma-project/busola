import React from 'react';
import { useTranslation } from 'react-i18next';

import { GatewaySelector } from '../Details/Gateway/GatewaySelector';

export function GatewaysList({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('gateways.selector'),
      value: gateway => <GatewaySelector key="selector" gateway={gateway} />,
    },
  ];

  const description = (
    <span>
      <a
        href="https://istio.io/latest/docs/reference/config/networking/gateway/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Gateway
      </a>
      {t('gateways.description')}
    </span>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
}
