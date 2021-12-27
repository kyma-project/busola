import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { GenericList, usePost, useNotification, useDelete } from 'react-shared';
import CreateEventSubscriptionModal from './CreateEventSubscriptionModal';
import { randomNameGenerator } from 'react-shared';
import { createSubscriptionInput } from './createSubscriptionInput';
import { Link } from 'fundamental-react';
import { navigateToFixedPathResourceDetails } from 'react-shared';
import './EventSubscriptions.scss';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';

const EventTypes = ({ filters }) => {
  return (
    <div className="event-types-wrapper ">
      {filters.length > 0 ? (
        filters?.map(filter => (
          <span className="fd-token fd-token--read-only">
            <span className="fd-token__text fd-has-font-size-small">
              {filter.eventType.value}
            </span>
          </span>
        ))
      ) : (
        <p>{EMPTY_TEXT_PLACEHOLDER}</p>
      )}
    </div>
  );
};

export default function EventSubscriptions({
  subscriptions = [],
  subscriptionsUrl,
  silentRefetch = function() {},
  ownerName,
  namespace,
  isLambda = false,
  serverDataError,
  serverDataLoading,
  i18n,
}) {
  const { t } = useTranslation();
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
        content: t('event-subscription.create.notifications.created'),
      });
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        title: t('event-subscription.create.notifications.failed'),
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
        content: t('event-subscription.create.notifications.removed'),
      });
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        title: t('event-subscription.create.notifications.failed-delete'),
        content: err.message,
        autoClose: false,
      });
    }
  }

  const actions = [
    {
      name: t('common.buttons.delete'),
      handler: handleSubscriptionDelete,
    },
  ];

  const headerRenderer = _ => [
    <p>Event Types</p>,
    t('common.headers.name'),
    t('common.headers.status'),
  ];

  const rowRenderer = subscription => [
    <EventTypes filters={subscription.spec.filter.filters} />,
    <Link
      onClick={() =>
        navigateToFixedPathResourceDetails(
          'eventsubscriptions',
          subscription.metadata.name,
        )
      }
    >
      {subscription.metadata.name}
    </Link>,
    <p>Status label</p>,
  ];

  const createModal = (
    <CreateEventSubscriptionModal
      isLambda={isLambda}
      onSubmit={handleSubscriptionAdded}
      i18n={i18n}
    />
  );

  return (
    <GenericList
      title={t('event-subscription.title')}
      showSearchField={true}
      textSearchProperties={['metadata.name']}
      showSearchSuggestion={false}
      extraHeaderContent={createModal}
      actions={actions}
      entries={subscriptions}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={serverDataError}
      serverDataLoading={serverDataLoading}
      notFoundMessage={t('event-subscription.errors.subscriptions-not-found')}
      noSearchResultMessage={t(
        'event-subscription.errors.not-matching-search-query',
      )}
      serverErrorMessage={t('event-subscription.errors.server')}
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
