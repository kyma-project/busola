import React from 'react';
import { InfoLabel, Icon, Token } from 'fundamental-react';
import {
  ControlledBy,
  Spinner,
  useGetList,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';

import EventSubscriptions from 'shared/components/EventSubscriptions/EventSubscriptions';
import './Service.details.scss';
import { ApiRulesList } from 'components/ApiRules/ApiRulesList';

function EventSubscriptionsWrapper({ service, i18n }) {
  const subscriptionsUrl = `/apis/eventing.kyma-project.io/v1alpha1/namespaces/${service.metadata.namespace}/subscriptions`;

  const filterBySink = ({ spec }) => {
    const { name, namespace } = service.metadata;
    // match spec.sink with http://{lambdaName}.{namespace}.svc.cluster.local
    const regex = `http://(.*?).${namespace}.svc.cluster.local`;
    const match = spec.sink.match(regex);
    return match && match[1] === name;
  };

  const {
    data: subscriptions = [],
    error,
    loading,
    silentRefetch,
  } = useGetList(filterBySink)(subscriptionsUrl, {
    pollingInterval: 3000,
  });

  if (!subscriptions) return <Spinner key="event-subscriptions" />;

  return (
    <EventSubscriptions
      key="event-subscriptions"
      isLambda={false}
      ownerName={service.metadata.name}
      namespace={service.metadata.namespace}
      silentRefetch={silentRefetch}
      subscriptions={subscriptions || []}
      subscriptionsUrl={subscriptionsUrl}
      serverDataError={error || false}
      serverDataLoading={loading || false}
      i18n={i18n}
    />
  );
}

export const ServicesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const customComponents = [];
  if (features?.EVENTING?.isEnabled) {
    customComponents.push(resource =>
      EventSubscriptionsWrapper({ service: resource, i18n }),
    );
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
