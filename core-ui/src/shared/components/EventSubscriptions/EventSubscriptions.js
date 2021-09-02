import React from 'react';
import PropTypes from 'prop-types';

import { GenericList, usePost, useNotification, useDelete } from 'react-shared';
import { EVENT_TRIGGERS_PANEL, ERRORS } from '../../constants';
import CreateEventSubscriptionModal from './CreateEventSubscriptionModal';
import { randomNameGenerator } from 'react-shared';
import { createSubscriptionInput } from './createSubscriptionInput';

const textSearchProperties = ['metadata.name', 'spec.protocol']; //TODO add filtering by eventType

export default function EventSubscriptions({
  subscriptions = [],
  subscriptionsUrl,
  silentRefetch = function() {},
  ownerName,
  namespace,
  isLambda = false,
  serverDataError,
  serverDataLoading,
  notFoundMessage = EVENT_TRIGGERS_PANEL.LIST.ERRORS.RESOURCES_NOT_FOUND,
  i18n,
}) {
  const notificationManager = useNotification();
  const postRequest = usePost();
  const deleteRequest = useDelete();
  async function handleSubscriptionAdded(eventType) {
    const name = `${ownerName}-${randomNameGenerator()}`;
    const sink = `http://${ownerName}.${namespace}.svc.cluster.local`;
    const subscriptionInput = createSubscriptionInput(
      name,
      namespace,
      sink,
      eventType,
    );

    try {
      await postRequest(`${subscriptionsUrl}/${name}`, subscriptionInput);
      silentRefetch();
      notificationManager.notifySuccess({
        content: 'Subscription created',
      });
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        title: 'Failed to create the Subscription',
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
        content: 'Subscription removed',
      });
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        title: 'Failed to delete the Subscription',
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
      i18n={i18n}
    />
  );
}

EventSubscriptions.propTypes = {
  subscriptions: PropTypes.array.isRequired,
  serverDataError: PropTypes.any,
  serverDataLoading: PropTypes.bool,
  subscriptionsUrl: PropTypes.string.isRequired,
  silentRefetch: PropTypes.func,
  namespace: PropTypes.string.isRequired,
  isLambda: PropTypes.bool,
  notFoundMessage: PropTypes.string,
};
