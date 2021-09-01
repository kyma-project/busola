import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormInput, ComboboxInput } from 'fundamental-react';

export function ExternalResourceRef({ resourceRef, onChange, resources }) {
  const { t } = useTranslation();
  const options = (resources || []).map((resource, index) => ({
    key: index,
    text: resource.metadata.name,
    namespace: resource.metadata.namespace,
  }));

  const selectResource = (e, selected) => {
    if (selected.key > -1) {
      onChange(e, { name: selected.text, namespace: selected.namespace });
    }
  };

  return (
    <>
      <ComboboxInput
        compact
        onChange={e => {
          onChange(e, { ...resourceRef, name: e.target.value });
        }}
        onSelectionChange={selectResource}
        placeholder={t('common.labels.name')}
        inputProps={{ value: resourceRef.name }}
        options={options}
        optionRenderer={resource => (
          <>
            <span class="fd-list__title">{resource.text}</span>
            <span className="fd-list__secondary">{resource.namespace}</span>
          </>
        )}
      />
      <FormInput
        compact
        onChange={e =>
          onChange(e, { ...resourceRef, namespace: e.target.value })
        }
        placeholder={t('common.labels.namespace')}
        value={resourceRef.namespace}
      />
    </>
  );
}
