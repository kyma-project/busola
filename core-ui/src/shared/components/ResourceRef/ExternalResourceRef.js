import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, ComboboxInput } from 'fundamental-react';

import './ExternalResourceRef.scss';

export function ExternalResourceRef({ resourceRef, onChange, resources }) {
  const { t } = useTranslation();
  const options = (resources || []).map(resource => ({
    key: `${resource.metadata.namespace}/${resource.metadata.name}`,
    text: resource.metadata.name,
    namespace: resource.metadata.namespace,
  }));

  const selectResource = (e, selected) => {
    console.log(selected.key);
    if (selected.key !== -1) {
      onChange(e, { name: selected.text, namespace: selected.namespace });
    }
  };

  return (
    <div className="external-resource-ref">
      <ComboboxInput
        id="external-resource-ref"
        ariaLabel={t('common.labels.name')}
        compact
        onChange={e => {
          onChange(e, { ...resourceRef, name: e.target.value });
        }}
        onSelectionChange={selectResource}
        placeholder={t('common.labels.name')}
        formItemProps={{ className: 'name' }}
        inputProps={{ value: resourceRef.name }}
        options={options}
        optionRenderer={resource => (
          <>
            <span className="fd-list__title">{resource.text}</span>
            <span className="fd-list__secondary">{resource.namespace}</span>
          </>
        )}
      />
      <div className="namespace fd-input-group--control fd-input-group">
        <FormInput
          compact
          className="fd-input-group__input"
          onChange={e =>
            onChange(e, { ...resourceRef, namespace: e.target.value })
          }
          placeholder={t('common.labels.namespace')}
          value={resourceRef.namespace}
        />
      </div>
    </div>
  );
}
