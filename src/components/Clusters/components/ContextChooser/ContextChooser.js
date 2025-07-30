import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Title,
  RadioButton,
  FlexBox,
  MessageBox,
  Button,
  Text,
  Label,
} from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { getUserDetail } from './helpers';

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
            <ContextButtons
              contexts={kubeconfig.contexts}
              users={kubeconfig?.users}
              setValue={setValue}
              chosenContext={params.chosenContext}
              setChosenContext={params.setChosenContext}
            />
          )}
        />
      </ResourceForm.Wrapper>
    </div>
  );
}
export function ContextButtons({
  users,
  contexts,
  setValue,
  chosenContext,
  setChosenContext,
}) {
  return (
    <FlexBox
      direction="Column"
      id="context-chooser"
      className="sap-margin-top-tiny"
    >
      {contexts.map(context => {
        return (
          <>
            <RadioButton
              key={context.name}
              name={context.name}
              value={context.name}
              checked={chosenContext === context.name}
              text={context.name}
              onChange={() => {
                setValue(context.name);
                if (setChosenContext) setChosenContext(context.name);
              }}
            />
            <div className="sap-margin-begin-medium">
              <Label showColon>IssuerUrl</Label>
              <Text>
                {getUserDetail(context.name, '--oidc-issuer-url=', users)}
              </Text>

              <Label showColon className="sap-margin-top-tiny">
                ClientID
              </Label>
              <Text>
                {getUserDetail(context.name, '--oidc-client-id=', users)}
              </Text>
            </div>
          </>
        );
      })}
    </FlexBox>
  );
}
export function ContextChooserMessage({ contexts, setValue, onCancel }) {
  const { t } = useTranslation();
  const [chosenContext, setChosenContext] = useState('');
  console.log(contexts);
  if (!Array.isArray(contexts?.contexts)) {
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
        <FlexBox direction="Column">
          {contexts.contexts.map(context => (
            <>
              <RadioButton
                id={'context-chooser' + context.name}
                key={context.name}
                name={context.name}
                value={context.name}
                checked={chosenContext === context.name}
                text={context.name}
                onChange={() => setChosenContext(context.name)}
              />
              <div className="sap-margin-begin-medium">
                <Label showColon>IssuerUrl</Label>
                <Text>
                  {getUserDetail(
                    context.name,
                    '--oidc-issuer-url=',
                    contexts?.users,
                  )}
                </Text>

                <Label showColon className="sap-margin-top-tiny">
                  ClientID
                </Label>
                <Text>
                  {getUserDetail(
                    context.name,
                    '--oidc-client-id=',
                    contexts?.users,
                  )}
                </Text>
              </div>
            </>
          ))}
        </FlexBox>
      </FlexBox>
    </MessageBox>
  );
}
