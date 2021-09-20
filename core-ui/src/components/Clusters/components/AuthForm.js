import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip, FormRadioGroup, FormRadioItem } from 'fundamental-react';
import * as jp from 'jsonpath';
import { createLoginCommand } from './oidc-params';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';

export const AUTH_FORM_TOKEN = 'Token';
export const AUTH_FORM_OIDC = 'OIDC';
export const DEFAULT_SCOPE_VALUE = 'openid';

function getUserIndex(kubeconfig) {
  const contextName = kubeconfig['current-context'];
  const { context } = kubeconfig.contexts.find(c => c.name === contextName);
  return kubeconfig.users.findIndex(u => u.name === context.user);
}

const OIDCform = ({ resource, setResource, ...props }) => {
  const { t } = useTranslation();
  const [auth, setAuth] = useState({});

  const userIndex = getUserIndex(resource);
  console.log('userIndex', userIndex);

  return (
    <ResourceForm.Wrapper
      resource={auth}
      setResource={auth => {
        console.log('auth', auth);
        jp.value(
          resource,
          `$.users[${userIndex}].user.exec`,
          createLoginCommand(auth),
        );
        setAuth(auth);
        setResource({ ...resource });
      }}
      {...props}
    >
      <ResourceForm.FormField
        required
        propertyPath="$.issuerUrl"
        label={t('clusters.auth.issuer-url')}
        input={ResourceForm.Input}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.clientId"
        label={t('clusters.auth.client-id')}
        input={ResourceForm.Input}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.scope"
        label={t('clusters.auth.scopes')}
        input={ResourceForm.Input}
      />
    </ResourceForm.Wrapper>
  );
};

const TokenForm = props => {
  const { t } = useTranslation();
  const userIndex = getUserIndex(props.resource);

  return (
    <ResourceForm.Wrapper {...props}>
      <ResourceForm.FormField
        required
        propertyPath={`$.users[${userIndex}].user.token`}
        label={t('clusters.auth.token')}
        input={ResourceForm.Input}
      />
    </ResourceForm.Wrapper>
  );
};

export function AuthForm({
  onValid,
  formElementRef,
  resource,
  setResource,
  ...props
}) {
  const [authType, setAuthType] = useState(AUTH_FORM_TOKEN);
  const { t } = useTranslation();
  console.log('AuthForm::getUserIndex', resource);
  const userIndex = getUserIndex(resource);

  return (
    <ResourceForm.Wrapper
      formEementRef={formElementRef}
      resource={resource}
      setResource={setResource}
      {...props}
    >
      <MessageStrip
        type="warning"
        className="fd-margin-top--sm fd-margin-bottom--sm"
      >
        {t('clusters.wizard.incomplete')}
      </MessageStrip>
      <FormRadioGroup
        className="fd-margin-bottom--sm"
        inline
        onChange={(_, type) => {
          const user = resource.users[userIndex];
          resource.users[userIndex] = { name: user.name };
          setResource(resource);
          setAuthType(type);
        }}
      >
        <FormRadioItem
          inputProps={{ defaultChecked: authType === AUTH_FORM_TOKEN }}
          data={AUTH_FORM_TOKEN}
        >
          Token
        </FormRadioItem>
        <FormRadioItem
          inputProps={{ defaultChecked: authType === AUTH_FORM_OIDC }}
          data={AUTH_FORM_OIDC}
        >
          OIDC provider
        </FormRadioItem>
      </FormRadioGroup>
      {authType === AUTH_FORM_OIDC ? <OIDCform /> : <TokenForm />}
    </ResourceForm.Wrapper>
  );
}
