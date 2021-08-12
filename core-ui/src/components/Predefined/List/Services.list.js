import React from 'react';
import { useTranslation } from 'react-i18next';

export const ServicesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const getEndpoints = service => {
    if (service.spec.ports?.length) {
      return (
        <ul>
          {service.spec.ports.map(port => {
            const portValue = `${service.metadata.name}.${otherParams.namespace}:${port.port} ${port.protocol}`;
            return <li key={portValue}>{portValue}</li>;
          })}
        </ul>
      );
    } else {
      return '';
    }
  };

  const getExternalIPs = service => {
    if (service.spec.externalIPs?.length) {
      return (
        <ul>
          {service.spec.externalIPs?.map(ip => (
            <li key={ip}>{ip}</li>
          ))}
        </ul>
      );
    } else {
      return '';
    }
  };

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
      header: t('services.internal-endpoints'),
      value: getEndpoints,
    },
    {
      header: t('services.external-ips'),
      value: getExternalIPs,
    },
  ];

  return <DefaultRenderer customColumns={customColumns} {...otherParams} />;
};
