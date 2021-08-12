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

  const getPorts = service => {
    if (!service.spec.ports?.length) {
      return '-';
    } else {
      return service.spec.ports?.map(getPortString).join(', ');
    }
  };

  const getExternalIPs = service => {
    if (!service.spec.externalIPs?.length) {
      return '-';
    } else {
      return service.spec.externalIPs.join(', ');
    }
  };

  const customColumns = [
    {
      header: t('services.type'),
      value: service => service.spec.type,
    },
    {
      header: t('services.cluster-ip'),
      value: service => service.spec.clusterIP,
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
