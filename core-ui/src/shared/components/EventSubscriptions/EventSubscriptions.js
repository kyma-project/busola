import React from 'react';
import PropTypes from 'prop-types';

import { GenericList, usePost, useNotification, useDelete } from 'react-shared';
import { EVENT_TRIGGERS_PANEL, ERRORS } from '../../constants';
import CreateEventSubscriptionModal from './CreateEventSubscriptionModal';
import { randomNamesGenerator } from '@kyma-project/common';
import { createSubscriptionInput } from './createSubscriptionInput';

const textSearchProperties = ['metadata.name', 'spec.protocol']; //TODO add filtering by eventType
const EVENT_TYPE_PREFIX = 'sap.kyma.custom.';

export default function EventSubscriptions({
  subscriptions = [],
  subscriptionsUrl,
  silentRefetch = function() {},
  ownerRef,
  namespace,
  isLambda = false,
  serverDataError,
  serverDataLoading,
  notFoundMessage = EVENT_TRIGGERS_PANEL.LIST.ERRORS.RESOURCES_NOT_FOUND,
}) {
  const notificationManager = useNotification();
  const postRequest = usePost();
  const deleteRequest = useDelete();

  async function handleSubscriptionAdded(eventType) {
    const name = `${ownerRef.name}-${randomNamesGenerator()}`;
    const sink = `http://${ownerRef.name}.${namespace}.svc.cluster.local`;
    const subscriptionInput = createSubscriptionInput(
      name,
      namespace,
      ownerRef,
      sink,
      EVENT_TYPE_PREFIX + eventType,
    );

    try {
      await postRequest(`${subscriptionsUrl}/${name}`, subscriptionInput);
      silentRefetch();
      notificationManager.notifySuccess({
        content: 'Subscription created succesfully',
      });
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        content: err.message,
        autoClose: false,
      });
    }
  }

  async function handleSubscriptionDelete(s) {
    try {
      await deleteRequest(`${subscriptionsUrl}/${s.metadata.name}`); //TODO use selfLink which is not there; why?
      silentRefetch();
      notificationManager.notifySuccess({
        content: 'Subscription removed succesfully',
      });
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        content: err.message,
        autoClose: false,
      });
    }
  }

  const actions = [
    {
      name: 'Delete',
      handler: handleSubscriptionDelete,
    },
  ];

  const headerRenderer = _ => ['Event Type', 'Name', 'Protocol'];
  const rowRenderer = subscription => [
    subscription.spec.filter.filters[0]?.eventType.value,
    subscription.metadata.name,
    subscription.spec.protocol || '-',
  ];

  const createModal = (
    <CreateEventSubscriptionModal
      isLambda={isLambda}
      onSubmit={handleSubscriptionAdded}
    />
  );

  return (
    <GenericList
      title={EVENT_TRIGGERS_PANEL.LIST.TITLE}
      showSearchField={true}
      textSearchProperties={textSearchProperties}
      showSearchSuggestion={false}
      extraHeaderContent={createModal}
      actions={actions}
      entries={subscriptions}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={serverDataError}
      serverDataLoading={serverDataLoading}
      notFoundMessage={notFoundMessage}
      noSearchResultMessage={
        EVENT_TRIGGERS_PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY
      }
      serverErrorMessage={ERRORS.SERVER}
    />
  );
}

EventSubscriptions.propTypes = {
  subscriptions: PropTypes.array.isRequired,
  serverDataError: PropTypes.any,
  serverDataLoading: PropTypes.bool,
  subscriptionsUrl: PropTypes.string.isRequired,
  silentRefetch: PropTypes.func,
  ownerRef: PropTypes.shape({
    name: PropTypes.string,
    kind: PropTypes.string,
    apiVersion: PropTypes.string,
    uid: PropTypes.string,
  }).isRequired,
  namespace: PropTypes.string.isRequired,
  isLambda: PropTypes.bool,
  notFoundMessage: PropTypes.string,
};
