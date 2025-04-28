import { useEffect, useState } from 'react';
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
          propertyPath='$["current-context"]'
          label={t('clusters.wizard.context')}
          validate={value => !!value}
          input={({ value, setValue }) => (
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
                  checked={value === context.name}
                  text={context.name}
                  onChange={() => setValue(context.name)}
                />
              ))}
            </FlexBox>
          )}
        />
      </ResourceForm.Wrapper>
    </div>
  );
}

export function ContextChooserPopup(params) {
  const kubeconfig = params.resource;
  const { t } = useTranslation();
  const [chosenContext, setChosenContext] = useState('');
  const [isOpen, setIsOpen] = useState(params.isOpen);

  useEffect(() => {
    if (params.isOpen && Array.isArray(kubeconfig.contexts) && !chosenContext) {
      setIsOpen(true);
    }
  }, [params.isOpen, kubeconfig.contexts, chosenContext]);

  if (!Array.isArray(kubeconfig.contexts)) {
    return '';
  }
  return (
    <ResourceForm.Wrapper {...params}>
      {chosenContext && (
        <div className="add-cluster__content-container">
          <Title level="H5">
            {chosenContext}
            <Button
              design="Transparent"
              className="sap-margin-begin-tiny"
              icon="edit"
              tooltip={t('clusters.edit-cluster')}
              onClick={() => setIsOpen(true)}
            />
          </Title>
        </div>
      )}
      <ResourceForm.FormField
        required
        propertyPath='$["current-context"]'
        validate={value => !!value}
        input={({ setValue }) => (
          <MessageBox
            style={{ width: '478px', height: '210px' }}
            type={undefined}
            titleText={'Choose cluster'}
            open={isOpen}
            className="ui5-content-density-compact"
            actions={[
              <Button
                key="confirmation"
                design="Emphasized"
                onClick={() => {
                  setValue(chosenContext);
                  setIsOpen(false);
                }}
                disabled={!chosenContext}
              >
                {t('common.buttons.choose')}
              </Button>,
              <Button
                key="cancel"
                design="Transparent"
                onClick={params.onCancel}
              >
                {t('common.buttons.cancel')}
              </Button>,
            ]}
          >
            <FlexBox direction="Column">
              <Text style={{ paddingLeft: '7.5px' }}>
                {t('clusters.wizard.several-context-info')}
                <br />
                {t('clusters.wizard.several-context-question')}
              </Text>
              <FlexBox direction="Column">
                {kubeconfig.contexts.map(context => (
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
        )}
      />
    </ResourceForm.Wrapper>
  );
}
