import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip, Switch, Title } from '@ui5/webcomponents-react';
import jp from 'jsonpath';
import { createLoginCommand, tryParseOIDCparams } from './oidc-params';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { getUser, getUserIndex } from '../shared';

import { spacing } from '@ui5/webcomponents-react-base';
import { TextArrayInput } from 'shared/ResourceForm/fields';

const OIDCform = ({ resource, setResource, ...props }) => {
  const { t } = useTranslation();

  const [auth, setAuth] = useState(tryParseOIDCparams(getUser(resource)) || {});
  const userIndex = getUserIndex(resource);

  useEffect(() => {
    setAuth(tryParseOIDCparams(getUser(resource)) || {});
  }, [resource]);

  return (
    <ResourceForm.Wrapper
      resource={auth}
      setResource={auth => {
        jp.value(
          resource,
          `$.users[${userIndex}].user.exec`,
          createLoginCommand(auth, resource?.users?.[userIndex]?.user?.exec),
        );
        setAuth(auth);
      }}
      {...props}
    >
      <ResourceForm.FormField
        required
        propertyPath="$.issuerUrl"
        label={t('clusters.wizard.auth.issuer-url')}
        input={Inputs.Text}
        accessible-name="issuer-url"
      />
      <ResourceForm.FormField
        required
        propertyPath="$.clientId"
        label={t('clusters.wizard.auth.client-id')}
        input={Inputs.Text}
        accessible-name="client-id"
      />
      <ResourceForm.FormField
        propertyPath="$.clientSecret"
        label={t('clusters.wizard.auth.client-secret')}
        input={Inputs.Text}
        accessible-name="client-secret"
      />
      <TextArrayInput
        required
        defaultOpen
        propertyPath="$.scopes"
        title={t('clusters.wizard.auth.scopes')}
        accessible-name="scopes"
      />
    </ResourceForm.Wrapper>
  );
};

const TokenForm = ({ resource, setResource, ...props }) => {
  const { t } = useTranslation();
  const userIndex = getUserIndex(resource);
  const [token, setToken] = useState(resource?.users?.[userIndex]?.user?.token);

  useEffect(() => {
    setToken(resource?.users?.[userIndex]?.user?.token);
  }, [resource, userIndex]);

  return (
    <ResourceForm.Wrapper resource={resource} {...props}>
      <ResourceForm.FormField
        required
        value={token}
        setValue={val => {
          setToken(val);
          jp.value(resource, `$.users[${userIndex}].user.token`, val);
        }}
        label={t('clusters.wizard.auth.token')}
        input={Inputs.Text}
        inputInfo={t('clusters.wizard.token-info')}
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

  const [useOidc, setUseOidc] = useState(!!getUser(resource)?.exec);

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
      <div className="add-cluster__content-container">
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
        {!useOidc && (
          <TokenForm resource={resource} setResource={setResource} />
        )}
        <ResourceForm.FormField
          label={t('clusters.wizard.auth.using-oidc')}
          input={() => (
            <Switch
              style={spacing.sapUiTinyMarginTop}
              checked={useOidc}
              onChange={switchAuthVariant}
            />
          )}
          className="oidc-switch"
        />
        {useOidc && <OIDCform resource={resource} setResource={setResource} />}
      </div>
    </ResourceForm.Wrapper>
  );
}
