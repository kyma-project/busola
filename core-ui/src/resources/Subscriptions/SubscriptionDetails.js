import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { GoToDetailsLink } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { SubscriptionConditionStatus } from 'shared/components/SubscriptionConditionStatus';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

import { SubscriptionConditions } from './SubscriptionConditions';

import { SubscriptionCreate } from './SubscriptionCreate';

import './EventFilters.scss';

const FilterOption = ({ filterOption, title }) => {
  const { t } = useTranslation();
  return (
    <div>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title} className="layout-panel-title" />
      </LayoutPanel.Header>
      <LayoutPanelRow
        name={t('subscriptions.headers.filters.property')}
        value={filterOption?.property || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('subscriptions.headers.filters.type')}
        value={filterOption?.type || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('subscriptions.headers.filters.value')}
        value={
          filterOption?.value === ''
            ? '"" (Handled by the NATS backend)' // If it's equal "", that means the NATS backend is chosen.
            : filterOption?.value || EMPTY_TEXT_PLACEHOLDER
        }
      />
    </div>
  );
};

const EventFilters = ({ filter }) => {
  const { t } = useTranslation();
  return (
    <div>
      <FilterOption
        title={t('subscriptions.headers.filters.event-source')}
        filterOption={filter?.eventSource}
      />
      <FilterOption
        title={t('subscriptions.headers.filters.event-type')}
        filterOption={filter?.eventType}
      />
    </div>
  );
};

const SubscriptionFilter = subscription => {
  const { t } = useTranslation();
  const filters = subscription?.spec?.filter?.filters || [];
  return (
    <LayoutPanel
      className="fd-margin--md event-filters-panel"
      key={'subscription-filters'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('subscriptions.headers.filters.title')} />
      </LayoutPanel.Header>

      {filters.length > 0 ? (
        filters.map((filter, i) => <EventFilters filter={filter} key={i} />)
      ) : (
        <p className="no-entries-message">
          {t('common.messages.no-entries-found')}
        </p>
      )}
    </LayoutPanel>
  );
};

export function SubscriptionDetails(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('subscriptions.headers.conditions.status'),
      value: ({ status }) => {
        const lastCondition = status?.conditions[status?.conditions.length - 1];
        return <SubscriptionConditionStatus condition={lastCondition} />;
      },
    },
    {
      header: t('common.headers.owner'),
      value: ({ spec }) => {
        const index = spec?.sink.lastIndexOf('/') + 1;

        const firstDot = spec?.sink.indexOf('.');
        const serviceName = spec?.sink.substring(index, firstDot);
        return (
          <p>
            {t('services.name_singular')}&nbsp;
            <GoToDetailsLink resource="services" name={serviceName} />
          </p>
        );
      },
    },
    {
      header: t('subscriptions.sink'),
      value: ({ spec }) => (
        <p>{spec?.sink ? spec.sink : EMPTY_TEXT_PLACEHOLDER}</p>
      ),
    },
  ];

  const Events = () => (
    <EventsList
      namespace={props.namespace}
      filter={filterByResource('Subscription', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  return (
    <ResourceDetails
      customComponents={[SubscriptionConditions, SubscriptionFilter, Events]}
      customColumns={customColumns}
      resourceTitle={t('subscriptions.title')}
      singularName={t('subscriptions.name_singular')}
      createResourceForm={SubscriptionCreate}
      {...props}
    />
  );
}

export default SubscriptionDetails;
