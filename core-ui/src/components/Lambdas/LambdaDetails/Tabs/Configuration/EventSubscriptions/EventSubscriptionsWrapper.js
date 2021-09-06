import React from 'react';
import PropTypes from 'prop-types';
import { useGetList, Spinner } from 'react-shared';
import EventSubscriptions from 'shared/components/EventSubscriptions/EventSubscriptions';

export default function EventSubscriptionsWrapper({ lambda, isActive, i18n }) {
  const subscriptionsUrl = `/apis/eventing.kyma-project.io/v1alpha1/namespaces/${lambda.metadata.namespace}/subscriptions`;

  const filterBySink = ({ spec }) => {
    const { name, namespace } = lambda.metadata;
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
    skip: !isActive,
  });

  if (!subscriptions) return <Spinner />;

  return (
    <EventSubscriptions
      isLambda={true}
      ownerName={lambda.metadata.name}
      namespace={lambda.metadata.namespace}
      silentRefetch={silentRefetch}
      subscriptions={subscriptions || []}
      subscriptionsUrl={subscriptionsUrl}
      serverDataError={error || false}
      serverDataLoading={loading || false}
      i18n={i18n}
    />
  );
}
EventSubscriptionsWrapper.propTypes = {
  lambda: PropTypes.shape({
    metadata: PropTypes.shape({
      name: PropTypes.string,
      namespace: PropTypes.string,
    }),
  }).isRequired,
};
