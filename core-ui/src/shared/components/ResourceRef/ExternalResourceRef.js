import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-shared';

export function ExternalResourceRef({ resourceRef, onChange, resources }) {
  const { t, i18n } = useTranslation();

  const format = resource => {
    if (!resource) return null;
    return `${resource.namespace}/${resource.name}`;
  };

  const options = (resources || []).map(resource => ({
    key: format(resource.metadata),
    text: format(resource.metadata),
    resource,
  }));

  const selectResource = (e, selected) => {
    onChange(e, {
      name: selected.resource.metadata.name,
      namespace: selected.resource.metadata.namespace,
    });
  };

  return (
    <div className="external-resource-ref">
      <Dropdown
        compact
        onSelect={selectResource}
        placeholder={t('common.labels.name')}
        selectedKey={format(resourceRef)}
        options={options}
        fullWidth
        i18n={i18n}
      />
    </div>
  );
}
