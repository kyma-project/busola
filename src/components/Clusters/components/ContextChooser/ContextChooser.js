import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Title,
  RadioButton,
  MessageBox,
  Button,
  Text,
  Label,
  List,
  ListItemCustom,
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
          validate={(value) => !!value}
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
    <List
      onItemClick={(e) => {
        setValue(e?.detail?.item?.children[0]?.children[0].value);
        if (setChosenContext)
          setChosenContext(e?.detail?.item?.children[0]?.children[0].value);
      }}
    >
      {contexts.map((context) => {
        return (
          <ListItemCustom key={context.name} style={{}}>
            <div>
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
              {users && (
                <AuthContextData contextName={context.name} users={users} />
              )}
            </div>
          </ListItemCustom>
        );
      })}
    </List>
  );
}
export function ContextChooserMessage({ contextState, setValue, onCancel }) {
  const { t } = useTranslation();
  const [chosenContext, setChosenContext] = useState('');

  if (!Array.isArray(contextState?.contexts)) {
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
      <List
        onItemClick={(e) => {
          setChosenContext(e?.detail?.item?.children[0]?.children[0].value);
        }}
      >
        {contextState.contexts.map((context) => (
          <ListItemCustom key={context.name} style={{}}>
            <div>
              <RadioButton
                id={'context-chooser' + context.name}
                key={context.name}
                name={context.name}
                value={context.name}
                checked={chosenContext === context.name}
                text={context.name}
                onChange={() => setChosenContext(context.name)}
              />
              {contextState?.users && (
                <AuthContextData
                  contextName={context.name}
                  users={contextState.users}
                />
              )}
            </div>
          </ListItemCustom>
        ))}
      </List>
    </MessageBox>
  );
}

function AuthContextData({ contextName, users }) {
  const { t } = useTranslation();

  const issuerUrl = getUserDetail(contextName, '--oidc-issuer-url=', users);
  const clientId = getUserDetail(contextName, '--oidc-client-id=', users);

  if (issuerUrl === null && clientId === null) return null;

  return (
    <div className="sap-margin-begin-medium sap-margin-bottom-small">
      <Label for="issuer-url" showColon className="sap-margin-bottom-tiny">
        {t('clusters.wizard.auth.issuer-url')}
      </Label>
      <Text id="issuer-url">{issuerUrl}</Text>

      <Label
        for="client-id"
        showColon
        className="sap-margin-top-tiny sap-margin-bottom-tiny"
      >
        {t('clusters.wizard.auth.client-id')}
      </Label>
      <Text id="client-id">{clientId}</Text>
    </div>
  );
}
