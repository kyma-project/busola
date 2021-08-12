import React from 'react';
import { useTranslation } from 'react-i18next';

import { intersperse } from 'react-shared';

export const ServicesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const getPortString = port => {
    if (port.port === port.targetPort) {
      return `${port.port}/${port.protocol}`;
    } else {
      return `${port.port}:${port.targetPort}/${port.protocol}`;
    }
  };

  const getPorts = service =>
    intersperse(service.spec.ports?.map(getPortString) || [], ', ');

  const getExternalIPs = service =>
    intersperse(service.spec.externalIPs || [], ', ');

  const customColumns = [
    {
      header: t('services.type'),
      value: service => service.spec.type,
    },
    {
      header: t('services.cluster-ip'),
      value: service => {
        return service.spec.clusterIP;
      },
    },
    {
      header: t('services.ports'),
      value: getPorts,
    },
    {
      header: t('services.external-ips'),
      value: getExternalIPs,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
