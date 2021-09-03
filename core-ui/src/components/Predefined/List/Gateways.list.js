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

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
}
