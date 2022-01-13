import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import { Filters } from './Filters';

export function FiltersSection({
  resource,
  setResource,
  onChange,
  namespace,
  createFilterTemplate,
  isAdvanced,
  ...props
}) {
  const { t } = useTranslation();
  return (
    <ResourceForm.Wrapper
      isAdvanced={isAdvanced}
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
        <Filters propertyPath="$.spec.filter.filters" />
      </ResourceForm.CollapsibleSection>
    </ResourceForm.Wrapper>
  );
}
