import React from 'react';
import PropTypes from 'prop-types';
import { useGetList, Spinner } from 'react-shared';
import EventSubscriptions from 'shared/components/EventSubscriptions/EventSubscriptions';
import {
  SERVERLESS_API_VERSION,
  SERVERLESS_RESOURCE_KIND,
} from '../../../../constants';

export default function EventSubscriptionsWrapper({ lambda, isActive }) {
  const subscriptionsUrl = `/apis/eventing.kyma-project.io/v1alpha1/namespaces/${lambda.metadata.namespace}/subscriptions`;

  const ownerRef = {
    apiVersion: SERVERLESS_API_VERSION,
    kind: SERVERLESS_RESOURCE_KIND,
    name: lambda.metadata.name,
    uid: lambda.metadata.uid,
  };

  const filterByOwnerRef = ({ metadata }) =>
    metadata.ownerReferences?.find(
      ref =>
        ref.kind === SERVERLESS_RESOURCE_KIND &&
        ref.name === lambda.metadata.name,
    );

  const {
    data: subscriptions = [],
    error,
    loading,
    silentRefetch,
  } = useGetList(filterByOwnerRef)(subscriptionsUrl, {
    pollingInterval: 3000,
    skip: !isActive,
  });

  if (!subscriptions) return <Spinner />;

  return (
    <EventSubscriptions
      isLambda={true}
      ownerRef={ownerRef}
      namespace={lambda.metadata.namespace}
      silentRefetch={silentRefetch}
      subscriptions={subscriptions || []}
      subscriptionsUrl={subscriptionsUrl}
      serverDataError={error || false}
      serverDataLoading={loading || false}
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
