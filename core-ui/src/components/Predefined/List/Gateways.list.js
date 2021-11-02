import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
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
      <Link
        className="fd-link"
        url="https://istio.io/latest/docs/reference/config/networking/gateway/"
        text="Gateway" // no translations here
      />
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
