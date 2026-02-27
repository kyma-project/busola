import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip, Switch, Title } from '@ui5/webcomponents-react';
import jp from 'jsonpath';
import {
  createLoginCommand,
  isOIDCExec,
  tryParseOIDCparams,
} from './oidc-params';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { getUser, getUserIndex } from '../shared';

import { TextArrayInput } from 'shared/ResourceForm/fields';

const OIDCform = ({ resource, ...props }) => {
  const { t } = useTranslation();

  const [auth, setAuth] = useState(tryParseOIDCparams(getUser(resource)) || {});
  const userIndex = getUserIndex(resource);
  const [prevResource, setPrevResource] = useState(resource);

  if (resource !== prevResource) {
    setPrevResource(resource);
    setAuth(tryParseOIDCparams(getUser(resource)) || {});
  }

  return (
    <ResourceForm.Wrapper
      resource={auth}
      setResource={(auth) => {
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
        accessible-name={t('clusters.wizard.auth.issuer-url')}
        {...props}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.clientId"
        label={t('clusters.wizard.auth.client-id')}
        input={Inputs.Text}
        accessible-name={t('clusters.wizard.auth.client-id')}
        {...props}
      />
      <ResourceForm.FormField
        propertyPath="$.clientSecret"
        label={t('clusters.wizard.auth.client-secret')}
        input={Inputs.Text}
        accessible-name={t('clusters.wizard.auth.client-secret')}
      />
      <TextArrayInput
        required
        defaultOpen
        propertyPath="$.scopes"
        title={t('clusters.wizard.auth.scopes')}
        accessible-name={t('clusters.wizard.auth.scopes')}
        ariaLabel={t('clusters.wizard.auth.scopes')}
        toExternal={props?.onChange}
      />
    </ResourceForm.Wrapper>
  );
};

const TokenForm = ({ resource, setResource, onChange, ...props }) => {
  const { t } = useTranslation();
  const userIndex = getUserIndex(resource);
  const exec = resource?.users?.[userIndex]?.user?.exec;
  const isGenericExec = !!exec && !isOIDCExec(exec);
  const [token, setToken] = useState(resource?.users?.[userIndex]?.user?.token);

  return (
    <ResourceForm.Wrapper
      resource={resource}
      setResource={setResource}
      {...props}
    >
      {isGenericExec && exec?.command && (
        <ResourceForm.FormField
          label={t('clusters.wizard.auth.exec-command')}
          input={Inputs.Text}
          value={exec.command}
          readOnly
        />
      )}
      <ResourceForm.FormField
        required
        value={token}
        setValue={(val) => {
          setToken(val);
          jp.value(resource, `$.users[${userIndex}].user.token`, val);
          setResource?.({ ...resource });
          onChange?.();
        }}
        label={t('clusters.wizard.auth.token')}
        input={Inputs.Text}
        inputInfo={
          isGenericExec
            ? t('clusters.wizard.auth.exec-info')
            : t('clusters.wizard.token-info')
        }
      />
    </ResourceForm.Wrapper>
  );
};

export function AuthForm({
  formElementRef = null,
  resource,
  setResource,
  revalidate = () => {},
  checkRequiredInputs = () => {},
  ...props
}) {
  const { t } = useTranslation();

  const userExec = getUser(resource)?.exec;
  const isGenericExec = !!userExec && !isOIDCExec(userExec);

  const [useOidc, setUseOidc] = useState(!isGenericExec && !!userExec);

  useEffect(() => {
    revalidate();
    checkRequiredInputs();
  }, [useOidc, revalidate, checkRequiredInputs]);

  const userIndex = getUserIndex(resource);

  const switchAuthVariant = () => {
    if (useOidc) {
      jp.value(resource, `$.users[${userIndex}].user.exec`, undefined);
    } else {
      jp.value(resource, `$.users[${userIndex}].user.token`, undefined);
    }
    setUseOidc(!useOidc);
  };

  const incompleteContext =
    resource['current-context'] === '-all-'
      ? resource.contexts[0]?.name
      : resource['current-context'];

  return (
    <ResourceForm.Wrapper
      formElementRef={formElementRef}
      resource={resource}
      setResource={setResource}
      {...props}
    >
      <div className="add-cluster__content-container">
        <Title level="H5">{t('clusters.wizard.update')}</Title>
        <MessageStrip
          design="Critical"
          hideCloseButton
          className="sap-margin-y-small"
        >
          {t('clusters.wizard.incomplete', { context: incompleteContext })}
        </MessageStrip>
        {!useOidc && (
          <TokenForm onChange={checkRequiredInputs} resource={resource} />
        )}
        {!isGenericExec && (
          <>
            <ResourceForm.FormField
              label={t('clusters.wizard.auth.using-oidc')}
              input={(props) => (
                <Switch
                  {...props}
                  className="sap-margin-top-tiny"
                  checked={useOidc}
                  onChange={switchAuthVariant}
                />
              )}
              className="oidc-switch"
            />
            {useOidc && (
              <OIDCform onChange={checkRequiredInputs} resource={resource} />
            )}
          </>
        )}
      </div>
    </ResourceForm.Wrapper>
  );
}
