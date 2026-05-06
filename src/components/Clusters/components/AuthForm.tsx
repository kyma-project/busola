import { useState, useEffect, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip, Switch, Title } from '@ui5/webcomponents-react';
import jp from 'jsonpath';
import {
  createLoginCommand,
  isOIDCExec,
  OidcConfig,
  tryParseOIDCparams,
} from './oidc-params';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { getUser, getUserIndex } from '../shared';

import { TextArrayInput } from 'shared/ResourceForm/fields';
import {
  Kubeconfig,
  KubeconfigNonOIDCAuthToken,
  KubeconfigOIDCAuth,
  ValidKubeconfig,
} from 'types';
import { ResourceFormWrapperProps } from 'shared/ResourceForm/components/Wrapper';
import { FormFieldProps } from 'shared/ResourceForm/components/FormField';

type OIDCformProps = {
  resource: Kubeconfig;
} & Partial<ResourceFormWrapperProps & FormFieldProps>;

const OIDCform = ({ resource, ...props }: OIDCformProps) => {
  const { t } = useTranslation();

  const [auth, setAuth] = useState(
    tryParseOIDCparams(getUser(resource) as KubeconfigOIDCAuth) || {},
  );
  const userIndex = getUserIndex(resource);
  const [prevResource, setPrevResource] = useState(resource);

  if (resource !== prevResource) {
    setPrevResource(resource);
    setAuth(tryParseOIDCparams(getUser(resource) as KubeconfigOIDCAuth) || {});
  }

  return (
    <ResourceForm.Wrapper
      resource={auth}
      setResource={(auth) => {
        jp.value(
          resource,
          `$.users[${userIndex}].user.exec`,
          createLoginCommand(
            auth as OidcConfig,
            (resource?.users?.[userIndex]?.user as KubeconfigOIDCAuth)?.exec,
          ),
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

type TokenFormProps = {
  resource: Kubeconfig;
  setResource?: (resource: Kubeconfig) => void;
  onChange?: () => void;
} & Partial<ResourceFormWrapperProps>;

const TokenForm = ({
  resource,
  setResource,
  onChange,
  ...props
}: TokenFormProps) => {
  const { t } = useTranslation();
  const userIndex = getUserIndex(resource);
  const exec = (resource?.users?.[userIndex]?.user as KubeconfigOIDCAuth)?.exec;
  const isGenericExec = !!exec && !isOIDCExec(exec);
  const [token, setToken] = useState(
    (resource?.users?.[userIndex]?.user as KubeconfigNonOIDCAuthToken)?.token,
  );

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
        setValue={(val: string) => {
          setToken(val);
          jp.value(resource, `$.users[${userIndex}].user.token`, val);
          setResource?.({ ...(resource as ValidKubeconfig) });
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

type AuthFormProps = {
  formElementRef?: RefObject<HTMLFormElement | null>;
  resource?: Kubeconfig;
  setResource?: (resource: Record<string, any>) => void;
  revalidate?: () => void;
  checkRequiredInputs?: () => void;
} & Record<string, any>;

export function AuthForm({
  formElementRef,
  resource,
  setResource,
  revalidate,
  checkRequiredInputs,
  ...props
}: AuthFormProps) {
  const { t } = useTranslation();

  const userExec = (getUser(resource ?? {}) as KubeconfigOIDCAuth)?.exec;
  const isGenericExec = !!userExec && !isOIDCExec(userExec);

  const [useOidc, setUseOidc] = useState(!isGenericExec && !!userExec);

  useEffect(() => {
    revalidate?.();
    checkRequiredInputs?.();
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
    resource?.['current-context'] === '-all-'
      ? resource?.contexts?.[0]?.name
      : resource?.['current-context'];

  return (
    <ResourceForm.Wrapper
      formElementRef={formElementRef}
      resource={resource}
      setResource={setResource as any}
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
          <TokenForm
            onChange={checkRequiredInputs}
            resource={resource as ValidKubeconfig}
          />
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
              <OIDCform
                onChange={checkRequiredInputs}
                resource={resource as ValidKubeconfig}
              />
            )}
          </>
        )}
      </div>
    </ResourceForm.Wrapper>
  );
}
