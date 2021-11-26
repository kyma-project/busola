import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'fundamental-react';

import { ResourceForm } from 'shared/ResourceForm';

import './ContextChooser.scss';

export function ContextChooser(params) {
  const kubeconfig = params.resource;
  const { t } = useTranslation();

  const contexts = Array.isArray(kubeconfig.contexts)
    ? kubeconfig.contexts.map(({ name }) => ({
        key: name,
        text: name,
      }))
    : [];

  return (
    <ResourceForm.Wrapper {...params}>
      <ResourceForm.FormField
        required
        propertyPath='$["current-context"]'
        label={t('clusters.wizard.context')}
        input={({ value, setValue }) => (
          <Select
            id="context-chooser"
            selectedKey={value}
            options={contexts}
            onSelect={(_, { text }) => setValue(text)}
          />
        )}
      />
    </ResourceForm.Wrapper>
  );
}
