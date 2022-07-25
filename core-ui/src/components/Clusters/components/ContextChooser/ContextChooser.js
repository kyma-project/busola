import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip, Select } from 'fundamental-react';

import { ResourceForm } from 'shared/ResourceForm';

import './ContextChooser.scss';

export function ContextChooser(params) {
  const kubeconfig = params.resource;
  const { t } = useTranslation();

  if (!Array.isArray(kubeconfig.contexts)) {
    return '';
  }

  const contexts = kubeconfig.contexts.map(({ name }) => ({
    key: name,
    text: name,
  }));
  contexts.push({
    key: '-all-',
    text: t('clusters.wizard.all-contexts'),
  });

  return (
    <ResourceForm.Wrapper {...params}>
      <ResourceForm.FormField
        required
        propertyPath='$["current-context"]'
        label={t('clusters.wizard.context')}
        validate={value => !!value}
        input={({ value, setValue }) => (
          <Select
            id="context-chooser"
            selectedKey={value}
            options={contexts}
            onSelect={(_, { key }) => setValue(key)}
          />
        )}
      />
      {kubeconfig['current-context'] === '-all-' && (
        <MessageStrip
          type="information"
          className="fd-margin-top--sm fd-margin-bottom--sm"
        >
          {t('clusters.wizard.multi-context-info', {
            context: kubeconfig.contexts[0]?.name,
          })}
        </MessageStrip>
      )}
    </ResourceForm.Wrapper>
  );
}
