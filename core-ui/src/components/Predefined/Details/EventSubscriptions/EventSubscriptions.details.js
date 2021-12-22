import { LayoutPanel } from 'fundamental-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_TEXT_PLACEHOLDER,
  ReadableCreationTimestamp,
  GenericList,
} from 'react-shared';
import { EventSubscriptionConditionStatus } from 'shared/components/EventSubscriptionConditionStatus';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import './EventFilters.scss';
import { Link } from 'fundamental-react';
import { navigateToFixedPathResourceDetails } from 'react-shared';

const EventSubscriptionConditions = eventSubscription => {
  const { t, i18n } = useTranslation();

  const conditions = eventSubscription?.status?.conditions;
  const headerRenderer = _ => [
    t('event-subscription.conditions.last-transition-time'),
    t('event-subscription.conditions.reason'),
    t('event-subscription.conditions.status'),
    t('event-subscription.conditions.type'),
  ];

  const rowRenderer = condition => [
    <ReadableCreationTimestamp timestamp={condition?.lastTransitionTime} />,
    condition?.reason || EMPTY_TEXT_PLACEHOLDER,
    <EventSubscriptionConditionStatus condition={condition} />,
    condition?.type || EMPTY_TEXT_PLACEHOLDER,
  ];

  return (
    <GenericList
      key="event-subscription-conditions"
      title={t('event-subscription.conditions.title')}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={conditions || []}
      i18n={i18n}
    />
  );
};

const FilterOption = ({ filterOption, title }) => {
  const { t } = useTranslation();

  return (
    <div>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title} className="layout-panel-title" />
      </LayoutPanel.Header>
      <LayoutPanelRow
        name={t('event-subscription.filters.property')}
        value={filterOption?.property || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('event-subscription.filters.type')}
        value={filterOption?.type || EMPTY_TEXT_PLACEHOLDER}
      />
      <LayoutPanelRow
        name={t('event-subscription.filters.value')}
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
        title={t('event-subscription.filters.event-source')}
        filterOption={filter?.eventSource}
      />
      <FilterOption
        title={t('event-subscription.filters.event-type')}
        filterOption={filter?.eventType}
      />
    </div>
  );
};

const EventSubscriptionsFilters = eventSubscription => {
  const { t } = useTranslation();
  const filters = eventSubscription?.spec?.filter?.filters || [];

  return (
    <LayoutPanel
      className="fd-margin--md event-filters-panel"
      key={'event-subscription-filters'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('event-subscription.filters.title')} />
      </LayoutPanel.Header>

      {filters.length > 0 ? (
        filters.map(filter => <EventFilters filter={filter} key={filter} />)
      ) : (
        <p className="no-entries-message">
          {t('common.messages.no-entries-found')}
        </p>
      )}
    </LayoutPanel>
  );
};

//the name of the function cannot have 'Event' prefix, becuase it doesn't show custom details view
export const SubscriptionsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('event-subscription.conditions.status'),
      value: ({ status }) => {
        const lastCondition = status?.conditions[status?.conditions.length - 1];
        return <EventSubscriptionConditionStatus condition={lastCondition} />;
      },
    },
    {
      header: t('event-subscription.sink'),
      value: ({ spec }) => {
        const index = spec?.sink.lastIndexOf('/') + 1;

        const firstDot = spec?.sink.indexOf('.');
        const serviceName = spec?.sink.substring(index, firstDot);
        return spec?.sink ? (
          <Link
            onClick={() =>
              navigateToFixedPathResourceDetails('services', serviceName)
            }
          >
            {spec?.sink}
          </Link>
        ) : (
          <p>{EMPTY_TEXT_PLACEHOLDER}</p>
        );
      },
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[
        EventSubscriptionConditions,
        EventSubscriptionsFilters,
      ]}
      customColumns={customColumns}
      resourceTitle={t('event-subscription.title')}
      singularName={t('event-subscription.name_singular')}
      {...otherParams}
    />
  );
};
