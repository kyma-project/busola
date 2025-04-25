import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageBox,
  Button,
  FlexBox,
  Text,
  RadioButton,
  Title,
} from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import './ContextChooser.scss';

export function ContextChooser(params) {
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
              <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              </div>
            </FlexBox>
          </MessageBox>
        )}
      />
    </ResourceForm.Wrapper>
  );
}
