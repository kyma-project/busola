import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Title,
  RadioButton,
  MessageBox,
  MessageStrip,
  Button,
  Text,
  Label,
  List,
  ListItemCustom,
  Ui5CustomEvent,
  ListDomRef,
} from '@ui5/webcomponents-react';
import { ResourceForm } from 'shared/ResourceForm';
import { getUserDetail } from './helpers';
import { ResourceFormWrapperProps } from 'shared/ResourceForm/components/Wrapper';
import { ListItemClickEventDetail } from '@ui5/webcomponents/dist/List';
import { useNonInteractiveOidcContexts } from '../oidc-interactive-check';
import { KubeconfigContext, KubeconfigUser, NestedPartial } from 'types';

import './ContextChooser.scss';
import { KubeConfigMultipleState } from 'state/multipleContextsAtom';

type ContextChooserProps = {
  resource?: Record<string, any>;
  chosenContext: string;
  setChosenContext: (context?: string) => void;
} & ResourceFormWrapperProps;

export function ContextChooser({
  resource,
  chosenContext,
  setChosenContext,
  ...props
}: ContextChooserProps) {
  const { t } = useTranslation();
  const nonInteractive = useNonInteractiveOidcContexts(
    resource?.contexts,
    resource?.users,
  );

  if (!Array.isArray(resource?.contexts)) {
    return '';
  }

  return (
    <div className="add-cluster__content-container">
      <ResourceForm.Wrapper resource={resource} {...props}>
        <Title className="sap-margin-bottom-small" level="H5">
          {t('clusters.messages.choose-cluster')}
        </Title>
        {resource?.contexts?.find((context) =>
          nonInteractive.has(context.name),
        ) && (
          <MessageStrip
            hideCloseButton
            design="Critical"
            className="sap-margin-bottom-small"
          >
            {t('clusters.wizard.non-interactive-oidc')}
          </MessageStrip>
        )}
        <ResourceForm.FormField
          required
          value={chosenContext}
          propertyPath='$["current-context"]'
          label={t('clusters.wizard.context')}
          validate={(value: string) => !!value}
          input={({ setValue }) => (
            <ContextButtons
              contexts={resource?.contexts}
              users={resource?.users}
              setValue={setValue}
              chosenContext={chosenContext}
              setChosenContext={setChosenContext}
            />
          )}
        />
      </ResourceForm.Wrapper>
    </div>
  );
}

type ContextButtonsProps = {
  users?: KubeconfigUser[];
  contexts: KubeconfigContext[];
  chosenContext: string;
  setValue: (context: string) => void;
  setChosenContext?: (context: string) => void;
};

export function ContextButtons({
  users,
  contexts,
  chosenContext,
  setValue,
  setChosenContext,
}: ContextButtonsProps) {
  const nonInteractive = useNonInteractiveOidcContexts(contexts, users);

  return (
    <List
      onItemClick={(
        e: Ui5CustomEvent<ListDomRef, ListItemClickEventDetail>,
      ) => {
        const contextElement = e?.detail?.item?.children?.[0]
          ?.children?.[0] as HTMLInputElement;
        const contextName = contextElement?.value;
        if (!contextName || nonInteractive.has(contextName)) return;
        setValue(contextName);
        if (setChosenContext) setChosenContext(contextName);
      }}
    >
      {contexts?.map((context) => {
        if (nonInteractive.has(context.name)) return null;
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

type ContextChooserMessageProps = {
  contextState?: KubeConfigMultipleState;
  setValue: (context: string) => void;
  onCancel: () => void;
};

export function ContextChooserMessage({
  contextState,
  setValue,
  onCancel,
}: ContextChooserMessageProps) {
  const { t } = useTranslation();
  const [chosenContext, setChosenContext] = useState('');
  const nonInteractive = useNonInteractiveOidcContexts(
    contextState?.contexts,
    contextState?.users,
  );

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
      {contextState?.contexts?.find((context) =>
        nonInteractive.has(context.name),
      ) && (
        <MessageStrip
          hideCloseButton
          design="Critical"
          className="sap-margin-small"
        >
          {t('clusters.wizard.non-interactive-oidc')}
        </MessageStrip>
      )}
      <List
        onItemClick={(e) => {
          const contextElement = e?.detail?.item?.children?.[0]
            ?.children?.[0] as HTMLInputElement;
          const contextName = contextElement?.value;
          if (!contextName || nonInteractive.has(contextName)) return;
          setChosenContext(contextName);
        }}
      >
        {contextState?.contexts?.map((context) => {
          if (nonInteractive.has(context.name)) return null;
          return (
            <ListItemCustom key={context.name}>
              <div>
                <RadioButton
                  id={'context-chooser' + context.name}
                  key={context.name}
                  name={context.name}
                  value={context.name}
                  checked={chosenContext === context.name}
                  text={context.name}
                  onChange={() => {
                    setChosenContext(context.name);
                  }}
                />
                {contextState?.users && (
                  <AuthContextData
                    contextName={context?.name}
                    users={contextState?.users as any}
                  />
                )}
              </div>
            </ListItemCustom>
          );
        })}
      </List>
    </MessageBox>
  );
}

type AuthContextDataProps = {
  contextName: string;
  users?: Array<NestedPartial<KubeconfigUser>>;
};

function AuthContextData({ contextName, users }: AuthContextDataProps) {
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
