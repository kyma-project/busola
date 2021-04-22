import React from 'react';
import { InfoLabel, Icon, Token } from 'fundamental-react';
import { Spinner, useGetList } from 'react-shared';
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

export const ServicesDetails = DefaultRenderer => ({ ...otherParams }) => {
  const customColumns = [
    {
      header: 'Cluster IP',
      value: resource => resource.spec.clusterIP,
    },
    {
      header: 'Ports',
      value: resource => (
        <>
          {resource.spec.ports?.map(p => (
            <Token key={p.name + p.targetPort} readOnly>
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
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[EventSubscriptionsWrapper, ApiRules]}
      {...otherParams}
    />
  );
};
