import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MessageStrip } from 'fundamental-react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { createFilterTemplate } from './templates';

function SingleFilterInputs({ filter, setFilter }) {
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper resource={filter} setResource={setFilter}>
      <ResourceForm.FormField
        required
        propertyPath="$.eventType.value"
        label={t('subscriptions.create.labels.event-type')}
        input={Inputs.Text}
        placeholder={t('subscriptions.create.placeholders.event-type')}
        tooltipContent={t('subscriptions.tooltips.event-type-advanced')}
      />
      <ResourceForm.FormField
        className="fd-margin-bottom--sm"
        propertyPath="$.eventSource.value"
        label={t('subscriptions.create.labels.event-source')}
        input={Inputs.Text}
        placeholder={t('subscriptions.create.placeholders.event-source')}
        tooltipContent={t('subscriptions.tooltips.event-source')}
      />
    </ResourceForm.Wrapper>
  );
}

function SingleFilterSection({ value: filters, setValue: setFilters }) {
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
      <SingleFilterInputs
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
      <SingleFilterInputs
        filter={filter || {}}
        setFilter={newFilter => {
          filters.splice(i, 1, newFilter);
          setFilters(filters);
        }}
      />
    </ResourceForm.CollapsibleSection>
  ));
}

export function FiltersSection({ resource, setResource, onChange, advanced }) {
  const { t } = useTranslation();
  return (
    <ResourceForm.Wrapper
      isAdvanced={advanced}
      resource={resource}
      setResource={setResource}
    >
      <ResourceForm.CollapsibleSection
        advanced
        title={t('subscriptions.create.labels.filters')}
        defaultOpen
        resource={resource}
        setResource={setResource}
        actions={setOpen => (
          <Button
            glyph="add"
            compact
            onClick={() => {
              const path = '$.spec.filter.filters';
              const nextFilters = [
                ...(jp.value(resource, path) || []),
                createFilterTemplate(),
              ];
              jp.value(resource, path, nextFilters);

              setResource({ ...resource });
              onChange(new Event('input', { bubbles: true }));
              setOpen(true);
            }}
          >
            {t('subscriptions.create.labels.add-filter')}
          </Button>
        )}
      >
        <SingleFilterSection propertyPath="$.spec.filter.filters" />
      </ResourceForm.CollapsibleSection>
    </ResourceForm.Wrapper>
  );
}
