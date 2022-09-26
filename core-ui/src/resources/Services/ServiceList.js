import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';

import { ServiceCreate } from './ServiceCreate';

export function ServiceList(props) {
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
    if (service.status.loadBalancer?.ingress) {
      return service.status.loadBalancer?.ingress
        .map(endpoint => endpoint.ip || endpoint.hostname)
        .join(', ');
    } else if (service.spec.externalIPs?.length) {
      return service.spec.externalIPs.join(', ');
    } else {
      return '-';
    }
  };

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: service => (
        <ControlledBy
          ownerReferences={service.metadata.ownerReferences}
          kindOnly
        />
      ),
    },
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

  const description = (
    <Trans i18nKey="services.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/services-networking/service/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={ServiceCreate}
    />
  );
}

export default ServiceList;
