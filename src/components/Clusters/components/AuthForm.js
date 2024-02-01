import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip, Switch, Title } from '@ui5/webcomponents-react';
import * as jp from 'jsonpath';
import { createLoginCommand, tryParseOIDCparams } from './oidc-params';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { getUser, getUserIndex } from '../shared';

import { spacing } from '@ui5/webcomponents-react-base';

export const AUTH_FORM_TOKEN = 'Token';
export const AUTH_FORM_OIDC = 'OIDC';
export const DEFAULT_SCOPE_VALUE = 'openid';

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
        input={Inputs.Text}
        aria-label="issuer-url"
      />
      <ResourceForm.FormField
        required
        propertyPath="$.clientId"
        label={t('clusters.wizard.auth.client-id')}
        input={Inputs.Text}
        aria-label="client-id"
      />
      <ResourceForm.FormField
        propertyPath="$.clientSecret"
        label={t('clusters.wizard.auth.client-secret')}
        input={Inputs.Text}
        aria-label="client-secret"
      />
      <ResourceForm.FormField
        required
        propertyPath="$.scope"
        label={t('clusters.wizard.auth.scopes')}
        input={Inputs.Text}
        aria-label="scopes"
      />
    </ResourceForm.Wrapper>
  );
};

const TokenForm = ({ resource, ...props }) => {
  const { t } = useTranslation();
  const userIndex = getUserIndex(resource);

  return (
    <ResourceForm.Wrapper resource={resource} {...props}>
      <ResourceForm.FormField
        required
        propertyPath={`$.users[${userIndex || 0}].user.token`}
        label={t('clusters.wizard.auth.token')}
        input={Inputs.Text}
      />
    </ResourceForm.Wrapper>
  );
};

export function AuthForm({
  formElementRef,
  resource,
  setResource,
  revalidate,
  ...props
}) {
  const { t } = useTranslation();

  const [useOidc, setUseOidc] = useState(
    getUser(resource)?.exec?.args?.[0] === 'oidc-login',
  );

  useEffect(() => {
    revalidate();
  }, [useOidc, revalidate]);

  const userIndex = getUserIndex(resource);

  const switchAuthVariant = () => {
    if (useOidc) {
      jp.value(resource, `$.users[${userIndex}].user.exec`, undefined);
    } else {
      jp.value(resource, `$.users[${userIndex}].user.token`, undefined);
    }
    setUseOidc(!useOidc);
  };

  return (
    <ResourceForm.Wrapper
      formEementRef={formElementRef}
      resource={resource}
      setResource={setResource}
      {...props}
    >
      <Title level="H5">{t('clusters.wizard.update')}</Title>
      <MessageStrip
        design="Warning"
        hideCloseButton
        style={spacing.sapUiSmallMarginTopBottom}
      >
        {t('clusters.wizard.incomplete', {
          context:
            resource['current-context'] === '-all-'
              ? resource.contexts[0]?.name
              : resource['current-context'],
        })}
      </MessageStrip>
      {!useOidc && <TokenForm />}
      {!useOidc && (
        <p className="cluster-wizard__token-info">
          {t('clusters.wizard.token-info')}
        </p>
      )}
      <ResourceForm.FormField
        label={t('clusters.wizard.auth.using-oidc')}
        input={() => <Switch checked={useOidc} onChange={switchAuthVariant} />}
      />
      {useOidc && <OIDCform />}
    </ResourceForm.Wrapper>
  );
}
