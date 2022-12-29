import React from 'react';

import SubscriptionsListComponent from 'resources/Subscriptions/SubscriptionList';

const getServiceName = sink => {
  if (typeof sink !== 'string') return '';

  const startIndex = sink?.lastIndexOf('/') + 1;
  const nextDot = sink?.indexOf('.');
  return sink?.substring(startIndex, nextDot);
};

export function SubscriptionsList({
  serviceName,
  namespace,
  prefix,
  disableCreate,
}) {
  const params = {
    hasDetailsView: true,
    resourceUrl: `/apis/eventing.kyma-project.io/v1alpha1/namespaces/${namespace}/subscriptions`,
    resourceType: 'subscriptions',
    namespace,
    isCompact: true,
    showTitle: true,
    createFormProps: { serviceName, prefix },
    disableCreate,
    filter: subscription => {
      return getServiceName(subscription.spec.sink) === serviceName;
    },
  };

  return <SubscriptionsListComponent {...params} />;
}
