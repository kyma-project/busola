import { useTranslation } from 'react-i18next';
import { MessageStrip, Select, Option, Title } from '@ui5/webcomponents-react';

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

  const onChange = (event, setValue) => {
    const selectedContext = event.detail.selectedOption.value;
    setValue(selectedContext);
  };

  return (
    <div className="add-cluster__content-container sap-margin-bottom-medium">
      <ResourceForm.Wrapper {...params} className="sap-margin-bottom-medium">
        <Title level="H5">{'Provide Context'}</Title>
        <ResourceForm.FormField
          required
          propertyPath='$["current-context"]'
          label={t('clusters.wizard.context')}
          validate={value => !!value}
          input={({ value, setValue }) => (
            <Select
              id="context-chooser"
              onChange={event => {
                onChange(event, setValue);
              }}
            >
              {contexts.map(context => (
                <Option
                  key={context.key}
                  value={context.key}
                  selected={value === context.key}
                >
                  {context.text}
                </Option>
              ))}
            </Select>
          )}
        />
        {kubeconfig['current-context'] === '-all-' && (
          <MessageStrip
            design="Information"
            hideCloseButton
            className="sap-margin-top-small sap-margin-bottom-small"
          >
            {t('clusters.wizard.multi-context-info', {
              context: kubeconfig.contexts[0]?.name,
            })}
          </MessageStrip>
        )}
      </ResourceForm.Wrapper>
    </div>
  );
}
