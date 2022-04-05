import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoLabel, Icon, Token } from 'fundamental-react';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { SubscriptionsList } from 'shared/components/SubscriptionsList';
import { ApiRulesList } from 'components/ApiRules/ApiRulesList';

import { ServiceCreate } from './ServiceCreate';
import './ServiceDetails.scss';

export function ServiceDetails(props) {
  const { t } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const customComponents = [];
  if (features?.EVENTING?.isEnabled) {
    customComponents.push(service => (
      <SubscriptionsList
        serviceName={service.metadata.name}
        namespace={service.metadata.namespace}
        key="subscriptionList"
      />
    ));
  }
  if (features?.API_GATEWAY?.isEnabled) {
    customComponents.push(service => (
      <ApiRulesList
        key={service}
        serviceName={service.metadata.name}
        namespace={service.metadata.namespace}
      />
    ));
  }

  const getExternalIPs = service => {
    if (service.status.loadBalancer?.ingress) {
      return service.status.loadBalancer?.ingress.map(
        endpoint => endpoint.ip || endpoint.hostname,
      );
    } else if (service.spec.externalIPs?.length) {
      return service.spec.externalIPs;
    } else {
      return [];
    }
  };

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: service => (
        <ControlledBy ownerReferences={service.metadata.ownerReferences} />
      ),
    },
    {
      header: t('services.type'),
      value: service => service.spec.type,
    },
    {
      header: t('services.cluster-ip'),
      value: resource => resource.spec.clusterIP,
    },
    {
      header: t('services.ports'),
      value: resource => (
        <>
          {resource.spec.ports?.map(p => (
            <Token
              key={p.name + p.targetPort}
              buttonLabel=""
              readOnly
              className="service-ports"
            >
              <span className="name">{p.name}</span>
              <InfoLabel numeric style={{ margin: '0 4px' }}>
                {p.port}
              </InfoLabel>
              <Icon glyph="arrow-right" ariaLabel="Port refers to" />
              <InfoLabel numeric style={{ margin: '0 4px' }}>
                {p.targetPort}
              </InfoLabel>
            </Token>
          ))}
        </>
      ),
    },
    {
      header: t('services.external-ips'),
      value: service => {
        const ips = getExternalIPs(service);
        if (!ips.length) {
          return '-';
        }
        return (
          <ul>
            {ips.map(ip => (
              <li key={ip}>{ip}</li>
            ))}
          </ul>
        );
      },
    },
  ];

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={customComponents}
      createResourceForm={ServiceCreate}
      {...props}
    />
  );
}

export default ServiceDetails;
