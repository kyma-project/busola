import React from 'react';
import { InfoLabel, Icon, Token } from 'fundamental-react';
import { Spinner, useGetList, useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';

import EventSubscriptions from 'shared/components/EventSubscriptions/EventSubscriptions';
import './Service.details.scss';
import { ServiceApiRules } from 'components/Lambdas/LambdaDetails/Tabs/Configuration/ApiRules/ApiRules';

function EventSubscriptionsWrapper(service) {
  const subscriptionsUrl = `/apis/eventing.kyma-project.io/v1alpha1/namespaces/${service.metadata.namespace}/subscriptions`;
  const ownerRef = {
    apiVersion: service.apiVersion,
    kind: service.kind,
    name: service.metadata.name,
    uid: service.metadata.uid,
  };

  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref => ref.kind === 'Service' && ref.name === service.metadata.name,
    );

  const {
    data: subscriptions = [],
    error,
    loading,
    silentRefetch,
  } = useGetList(filterByOwnerRef)(subscriptionsUrl, {
    pollingInterval: 3000,
  });

  if (!subscriptions) return <Spinner key="event-subscriptions" />;

  return (
    <EventSubscriptions
      key="event-subscriptions"
      isLambda={false}
      ownerRef={ownerRef}
      namespace={service.metadata.namespace}
      silentRefetch={silentRefetch}
      subscriptions={subscriptions || []}
      subscriptionsUrl={subscriptionsUrl}
      serverDataError={error || false}
      serverDataLoading={loading || false}
    />
  );
}

function ApiRules(service) {
  return <ServiceApiRules key="api-rules" service={service} />;
}

export const ServicesDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const customComponents = [];
  if (features?.EVENTING?.isEnabled) {
    customComponents.push(EventSubscriptionsWrapper);
  }
  if (features?.API_GATEWAY?.isEnabled) {
    customComponents.push(ApiRules);
  }

  const customColumns = [
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
      value: service => (
        <ul>
          {service.spec.externalIPs?.map(ip => (
            <li key={ip}>{ip}</li>
          ))}
        </ul>
      ),
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
