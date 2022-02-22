import React from 'react';
import { InfoLabel, Icon, Token } from 'fundamental-react';
import { ControlledBy, useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';

import './Service.details.scss';
import { ApiRulesList } from 'components/ApiRules/ApiRulesList';
import { SubscriptionsList } from 'shared/components/SubscriptionsList';

export const ServicesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const customComponents = [];
  if (features?.EVENTING?.isEnabled) {
    customComponents.push(service => (
      <SubscriptionsList
        serviceName={service.metadata.name}
        namespace={service.metadata.namespace}
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
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={customComponents}
      {...otherParams}
    />
  );
};
