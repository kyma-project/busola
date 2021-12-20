import { LayoutPanel } from 'fundamental-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_TEXT_PLACEHOLDER,
  FormattedDatetime,
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
    'LastTransitionTime',
    'Reason',
    'Status',
    'Type',
  ];

  const rowRenderer = condition => [
    <FormattedDatetime
      date={condition.lastTransitionTime}
      lang={i18n.language}
    />,
    condition.reason,
    <EventSubscriptionConditionStatus condition={condition} />,
    condition.type,
  ];

  return (
    <GenericList
      key="repository-urls"
      title="Conditions"
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={conditions || []}
      i18n={i18n}
    />
  );
};

const FilterOption = ({ filterOption, title }) => (
  <div>
    <LayoutPanel.Header>
      <LayoutPanel.Head title={title} className="layout-panel-title" />
    </LayoutPanel.Header>
    <LayoutPanelRow
      name="property"
      value={filterOption?.property || EMPTY_TEXT_PLACEHOLDER}
    />
    <LayoutPanelRow
      name="type"
      value={filterOption?.type || EMPTY_TEXT_PLACEHOLDER}
    />
    <LayoutPanelRow
      name="value"
      value={
        filterOption?.value === ''
          ? '""' // If it's equal "", that means the NATS backend is chosen.
          : filterOption?.value || EMPTY_TEXT_PLACEHOLDER
      }
    />
  </div>
);

const EventFilter = ({ filter }) => {
  return (
    <div>
      <FilterOption title="Event Source" filterOption={filter?.eventSource} />
      <FilterOption title="Event Type" filterOption={filter?.eventType} />
    </div>
  );
};

const EventSubscriptionsFilters = eventSubscription => {
  const filters = eventSubscription?.spec?.filter?.filters || [];
  return (
    <LayoutPanel
      className="fd-margin--md certificate-refs-panel"
      key={'event-subscription-filters'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Filters" />
      </LayoutPanel.Header>

      {filters.length > 0 ? (
        filters.map(filter => <EventFilter filter={filter} key={filter} />)
      ) : (
        <p>No entries found</p>
      )}
    </LayoutPanel>
  );
};

//the name of the function cannot have 'Event' prefix, becuase it doesn't show custom details view
export const SubscriptionsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const customColumns = [
    {
      header: 'Status',
      value: ({ status }) => (
        <EventSubscriptionConditionStatus status={status} />
      ),
    },
    {
      header: 'Sink',
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
      resourceTitle="Event Subscriptions"
      singularName="Event Subscription"
      {...otherParams}
    />
  );
};
