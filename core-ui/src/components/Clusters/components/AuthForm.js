import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip, FormRadioGroup, FormRadioItem } from 'fundamental-react';
import * as jp from 'jsonpath';
import { createLoginCommand, tryParseOIDCparams } from './oidc-params';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { getUser } from '../shared';

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
  const [auth, setAuth] = useState(tryParseOIDCparams(getUser(resource)) || {});

  const userIndex = getUserIndex(resource);

  return (
    <ResourceForm.Wrapper
      resource={auth}
      setResource={auth => {
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
        label={t('clusters.wizard.auth.issuer-url')}
        input={ResourceForm.Input}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.clientId"
        label={t('clusters.wizard.auth.client-id')}
        input={ResourceForm.Input}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.scope"
        label={t('clusters.wizard.auth.scopes')}
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
        label={t('clusters.wizard.auth.token')}
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
  const hasToken = getUser(resource)?.token;
  const hasOidc = getUser(resource)?.exec?.args?.[0] === 'oidc-login';
  const [authType, setAuthType] = useState(
    hasOidc ? AUTH_FORM_OIDC : AUTH_FORM_TOKEN,
  );
  const { t } = useTranslation();
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
