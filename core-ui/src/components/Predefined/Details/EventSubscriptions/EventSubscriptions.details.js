import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { EventSubscriptionConditionStatus } from 'shared/components/EventSubscriptionConditionStatus';
import { LayoutPanel, FormItem, FormLabel } from 'fundamental-react';
import './EventFilters.scss';

// const RepositoryUrls = addon => {
//   const { t, i18n } = useTranslation();

//   const headerRenderer = _ => [
//     t('addons.headers.url'),
//     t('common.headers.status'),
//   ];

//   const rowRenderer = repo => [repo.url, <div />];

//   return (
//     <GenericList
//       key="repository-urls"
//       title={t('addons.repository-urls')}
//       headerRenderer={headerRenderer}
//       rowRenderer={[]}
//       entries={addon.status.repositories || []}
//       i18n={i18n}
//     />
//   );
// };

const FilterOption = ({ filterOption, title }) => {
  return (
    <div>
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title} />
      </LayoutPanel.Header>
      <div className="filter-option">
        <FormItem>
          <FormLabel>property</FormLabel>
          <p>
            {filterOption?.property
              ? filterOption?.property
              : EMPTY_TEXT_PLACEHOLDER}
          </p>
        </FormItem>
        <FormItem>
          <FormLabel>type</FormLabel>
          <p>
            {filterOption?.type ? filterOption?.type : EMPTY_TEXT_PLACEHOLDER}
          </p>
        </FormItem>
        <FormItem>
          <FormLabel>value</FormLabel>
          <p>
            {filterOption?.value ? filterOption?.value : EMPTY_TEXT_PLACEHOLDER}
          </p>
        </FormItem>
      </div>
    </div>
  );
};

const EventFilter = ({ filter }) => {
  return (
    <div>
      <FilterOption title="eventSource" filterOption={filter.eventSource} />
      <FilterOption title="eventType" filterOption={filter.eventType} />
    </div>
  );
};

const EventSubscriptionsFilters = eventSubscription => {
  const filters = eventSubscription?.spec.filter.filters;
  return (
    <LayoutPanel
      className="fd-margin--md certificate-refs-panel"
      key={'event-subscription-filters'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Filters" />
      </LayoutPanel.Header>

      {filters.length > 0 ? (
        filters.map(filter => <EventFilter filter={filter} />)
      ) : (
        <p>xd</p>
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
  ];

  return (
    <DefaultRenderer
      customComponents={[EventSubscriptionsFilters]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
