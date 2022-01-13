import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MessageStrip } from 'fundamental-react';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';

function SingleFilter({ filter, setFilter }) {
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper resource={filter} setResource={setFilter}>
      <ResourceForm.FormField
        required
        propertyPath="$.eventType.value"
        label={t('subscriptions.create.labels.event-type')}
        input={Inputs.Text}
        placeholder={t('subscriptions.create.placeholders.event-type')}
      />
      <ResourceForm.FormField
        className="fd-margin-bottom--sm"
        propertyPath="$.eventSource.value"
        label={t('subscriptions.create.labels.event-source')}
        input={Inputs.Text}
        placeholder={t('subscriptions.create.placeholders.event-source')}
      />
    </ResourceForm.Wrapper>
  );
}

export function Filters({ value: filters, setValue: setFilters }) {
  const { t } = useTranslation();

  const removeFilter = index => {
    setFilters(filters.filter((_, i) => index !== i));
  };

  filters = filters || [];

  if (!filters.length) {
    return (
      <MessageStrip type="warning">
        {t('subscriptions.create.messages.one-filter-required')}
      </MessageStrip>
    );
  }

  if (filters.length === 1) {
    return (
      <SingleFilter
        filter={filters[0]}
        setFilter={newFilter => {
          filters.splice(0, 1, newFilter);
          setFilters(filters);
        }}
      />
    );
  }

  return filters.map((filter, i) => (
    <ResourceForm.CollapsibleSection
      key={i}
      title={t('subscriptions.create.labels.filter', {
        name: filter?.name || i + 1,
      })}
      actions={
        <Button
          glyph="delete"
          type="negative"
          compact
          onClick={() => removeFilter(i)}
        />
      }
    >
      <SingleFilter
        filter={filter || {}}
        setFilter={newFilter => {
          filters.splice(i, 1, newFilter);
          setFilters(filters);
        }}
      />
    </ResourceForm.CollapsibleSection>
  ));
}
