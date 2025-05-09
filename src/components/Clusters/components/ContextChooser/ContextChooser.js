import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Title,
  RadioButton,
  FlexBox,
  MessageBox,
  Button,
  Text,
} from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import './ContextChooser.scss';

export function ContextChooser(params) {
  const kubeconfig = params.resource;
  const { t } = useTranslation();

  if (!Array.isArray(kubeconfig.contexts)) {
    return '';
  }

  return (
    <div className="add-cluster__content-container">
      <ResourceForm.Wrapper {...params}>
        <Title className="sap-margin-bottom-small" level="H5">
          {t('clusters.wizard.provide-context')}
        </Title>
        <ResourceForm.FormField
          required
          value={params.chosenContext}
          propertyPath='$["current-context"]'
          label={t('clusters.wizard.context')}
          validate={value => !!value}
          input={({ setValue }) => (
            <FlexBox
              direction="Column"
              id="context-chooser"
              className="sap-margin-top-tiny"
            >
              {kubeconfig.contexts.map(context => (
                <RadioButton
                  key={context.name}
                  name={context.name}
                  value={context.name}
                  checked={params.chosenContext === context.name}
                  text={context.name}
                  onChange={() => {
                    setValue(context.name);
                    params.setChosenContext(context.name);
                  }}
                />
              ))}
            </FlexBox>
          )}
        />
      </ResourceForm.Wrapper>
    </div>
  );
}

export function ContextChooserMessage({ contexts, setValue, onCancel }) {
  const { t } = useTranslation();
  const [chosenContext, setChosenContext] = useState('');

  if (!Array.isArray(contexts)) {
    return null;
  }
  return (
    <MessageBox
      titleText={t('clusters.messages.choose-cluster')}
      open={true}
      className="ui5-content-density-compact context-chooser-message"
      actions={[
        <Button
          key="confirmation"
          design="Emphasized"
          onClick={() => setValue(chosenContext)}
          disabled={!chosenContext}
        >
          {t('common.buttons.choose')}
        </Button>,
        <Button key="cancel" design="Transparent" onClick={onCancel}>
          {t('common.buttons.cancel')}
        </Button>,
      ]}
    >
      <FlexBox direction="Column" gap={16}>
        <Text className="context-chooser-content-text">
          {t('clusters.wizard.several-context-info')}
          <br />
          {t('clusters.wizard.several-context-question')}
        </Text>
        <FlexBox direction="Column" className="radio-box-container">
          {contexts.map(context => (
            <RadioButton
              id={'context-chooser' + context.name}
              key={context.name}
              name={context.name}
              value={context.name}
              checked={chosenContext === context.name}
              text={context.name}
              onChange={() => setChosenContext(context.name)}
            />
          ))}
        </FlexBox>
      </FlexBox>
    </MessageBox>
  );
}
