import React from 'react';
import { getComponentForList } from 'shared/getComponents';
import { Spinner, useGetList } from 'react-shared';
import EventSubscriptions from 'shared/components/EventSubscriptions/EventSubscriptions';

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
            <span className="fd-counter" key={p.port}>
              {p.port}
            </span>
          ))}
        </>
      ),
    },
  ];

  const ApiRuleList = getComponentForList({
    name: 'apiruleList',
    params: {
      hasDetailsView: true,
      fixedPath: true,
      resourceUrl: `/apis/gateway.kyma-project.io/v1alpha1/namespaces/${otherParams.namespace}/apirules`,
      resourceType: 'apirules',
      namespace: otherParams.namespace,
      isCompact: true,
      showTitle: true,
      filter: apirule => apirule.spec.service.name === otherParams.resourceName,
    },
  });
  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[EventSubscriptionsWrapper]}
      {...otherParams}
    >
      {ApiRuleList}
    </DefaultRenderer>
  );
};
