import { useState, useRef, useEffect, FormEvent, RefObject } from 'react';
import jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import { MessageStrip } from '@ui5/webcomponents-react';
import { useSetAtom } from 'jotai';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, TextArrayInput } from 'shared/ResourceForm/fields';
import { ChooseStorage } from 'components/Clusters/components/ChooseStorage';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useNotification } from 'shared/contexts/NotificationContext';
import * as Inputs from 'shared/ResourceForm/inputs';
import { AuthenticationTypeDropdown } from 'components/Clusters/views/EditCluster/AuthenticationDropdown';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { authDataAtom } from 'state/authDataAtom';

import { isOIDCExec } from 'components/Clusters/components/oidc-params';
import { addCluster, getContext, deleteCluster, getUser } from '../../shared';
import { getUserIndex } from '../../shared';
import { ContextButtons } from 'components/Clusters/components/ContextChooser/ContextChooser';
import {
  Kubeconfig,
  KubeconfigNonOIDCAuthToken,
  KubeconfigOIDCAuth,
  LoginCommand,
} from 'types';

export const findInitialValues = (
  kubeconfig: Kubeconfig,
  id: string,
  userIndex = 0,
) => {
  const elementsWithId =
    (
      kubeconfig?.users?.[userIndex]?.user as KubeconfigOIDCAuth
    )?.exec?.args?.filter((el) => el?.includes(id)) || [];
  const regex = new RegExp(`${id}=(?<value>.*)`);
  const values = [];

  for (const element of elementsWithId) {
    const match = regex.exec(element);
    if (match?.groups?.value) {
      values.push(match.groups.value);
    }
  }

  return values;
};

export const findInitialValue = (
  kubeconfig: Kubeconfig,
  id: string,
  userIndex = 0,
) => {
  const user = kubeconfig?.users?.[userIndex]?.user as KubeconfigOIDCAuth;
  if (user?.exec?.args) {
    const elementWithId = user?.exec?.args.find((el) => el?.includes(id)) ?? '';
    const regex = new RegExp(`${id}=(?<value>.*)`);
    return regex.exec(elementWithId)?.groups?.value || '';
  }
  return '';
};

type ClusterDataFormProps = {
  kubeconfig: Kubeconfig;
  setResource: (resource: Kubeconfig) => void;
  onChange: () => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  resourceUrl?: string;
  formElementRef?: RefObject<HTMLFormElement>;
  className?: string;
  modeSelectorDisabled?: boolean;
  initialMode?: 'MODE_FORM' | 'MODE_YAML';
  yamlSearchDisabled?: boolean;
  yamlHideDisabled?: boolean;
};

export const ClusterDataForm = ({
  kubeconfig,
  setResource,
  onChange,
  onSubmit,
  resourceUrl,
  formElementRef,
  className = '',
  modeSelectorDisabled = false,
  initialMode,
  yamlSearchDisabled,
  yamlHideDisabled,
}: ClusterDataFormProps) => {
  const { t } = useTranslation();
  const userIndex = getUserIndex(kubeconfig);
  const getAuthType = (kc: Kubeconfig, idx: number) => {
    const exec = (kc?.users?.[idx]?.user as KubeconfigOIDCAuth)?.exec;
    return exec && isOIDCExec(exec) ? 'oidc' : 'token';
  };
  const [authenticationType, setAuthenticationType] = useState(
    getAuthType(kubeconfig, userIndex),
  );
  const hasOneContext = kubeconfig?.contexts?.length === 1;
  const [chosenContext, setChosenContext] = useState(
    kubeconfig?.['current-context'],
  );
  const issuerUrl = findInitialValue(kubeconfig, 'oidc-issuer-url', userIndex);
  const clientId = findInitialValue(kubeconfig, 'oidc-client-id', userIndex);
  const clientSecret = findInitialValue(
    kubeconfig,
    'oidc-client-secret',
    userIndex,
  );
  const scopes = findInitialValues(kubeconfig, 'oidc-extra-scope', userIndex);

  useEffect(() => {
    setAuthenticationType(getAuthType(kubeconfig, userIndex));
  }, [kubeconfig, userIndex]);

  const user = kubeconfig?.users?.[userIndex]?.user as KubeconfigOIDCAuth;
  const execCommand = user?.exec?.command;
  const isGenericExec = !!user?.exec && !isOIDCExec(user?.exec);

  const tokenFields = (
    <>
      {isGenericExec && execCommand && (
        <ResourceForm.FormField
          label={t('clusters.wizard.auth.exec-command')}
          input={Inputs.Text}
          value={execCommand}
          readOnly
        />
      )}
      <ResourceForm.FormField
        label={t('clusters.token')}
        input={Inputs.Text}
        required
        onChange={onChange}
        inputInfo={
          isGenericExec ? t('clusters.wizard.auth.exec-info') : undefined
        }
        value={
          (kubeconfig?.users?.[userIndex]?.user as KubeconfigNonOIDCAuthToken)
            ?.token
        }
        setValue={(val: string) => {
          jp.value(kubeconfig, `$.users[${userIndex}].user.token`, val);
          setResource({ ...kubeconfig });
        }}
      />
    </>
  );

  const createOIDC = (type = '', val = '') => {
    const config = { issuerUrl, clientId, clientSecret, scopes, [type]: val };
    const exec = {
      ...(kubeconfig?.users?.[userIndex]?.user as KubeconfigOIDCAuth)?.exec,
      apiVersion: 'client.authentication.k8s.io/v1beta1',
      command: 'kubectl',
      args: [
        'oidc-login',
        'get-token',
        `--oidc-issuer-url=${config.issuerUrl}`,
        `--oidc-client-id=${config.clientId}`,
        `--oidc-client-secret=${config.clientSecret}`,
        ...(config.scopes?.length
          ? config.scopes.map((scope) => `--oidc-extra-scope=${scope || ''}`)
          : [`--oidc-extra-scope=openid`]),
        '--grant-type=auto',
      ],
    };
    jp.value(kubeconfig, `$.users[${userIndex}].user.exec`, exec);
    setResource({ ...kubeconfig });
  };

  const OIDCFields = (
    <>
      <ResourceForm.FormField
        label={t('clusters.labels.issuer-url')}
        input={Inputs.Text}
        required
        value={issuerUrl}
        onChange={onChange}
        setValue={(val: string) => {
          createOIDC('issuerUrl', val);
        }}
      />
      <ResourceForm.FormField
        label={t('clusters.labels.client-id')}
        input={Inputs.Text}
        required
        value={clientId}
        onChange={onChange}
        setValue={(val: string) => {
          createOIDC('clientId', val);
        }}
      />
      <ResourceForm.FormField
        label={t('clusters.labels.client-secret')}
        input={Inputs.Text}
        value={clientSecret}
        setValue={(val: string) => {
          createOIDC('clientSecret', val);
        }}
      />
      <TextArrayInput
        required
        defaultOpen
        title={t('clusters.labels.scopes')}
        value={scopes}
        toExternal={onChange}
        setValue={(val: string) => {
          createOIDC('scopes', val);
        }}
      />
    </>
  );

  return (
    <ResourceForm
      pluralKind="clusters"
      singularName={t(`clusters.name_singular`)}
      title={t('clusters.wizard.kubeconfig')}
      resource={kubeconfig}
      setResource={setResource}
      initialResource={kubeconfig}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      onSubmit={onSubmit}
      autocompletionDisabled
      disableDefaultFields={true}
      modeSelectorDisabled={modeSelectorDisabled}
      initialMode={initialMode}
      yamlSearchDisabled={yamlSearchDisabled}
      yamlHideDisabled={yamlHideDisabled}
    >
      <div className={className}>
        <K8sNameField
          kind={t('clusters.name_singular')}
          date-testid="cluster-name"
          value={
            kubeconfig ? jp.value(kubeconfig, '$["current-context"]') : null
          }
          setValue={(name) => {
            if (kubeconfig) {
              jp.value(kubeconfig, '$["current-context"]', name);
              jp.value(kubeconfig, `$.contexts[${userIndex}].name`, name);

              setResource({ ...kubeconfig });
            }
          }}
        />
        {!hasOneContext && (
          <ResourceForm.FormField
            required
            value={chosenContext}
            propertyPath='$["current-context"]'
            label={t('clusters.labels.context')}
            validate={(value: string) => !!value}
            setValue={(context: string) => {
              jp.value(kubeconfig, '$["current-context"]', context);
              if (!getUser(kubeconfig) && kubeconfig?.users?.length) {
                jp.value(kubeconfig, `$.users`, [
                  ...(kubeconfig?.users ?? []),
                  { name: context },
                ]);
              }
              onChange();
              setChosenContext(context);
              setResource({ ...kubeconfig });
            }}
            input={({ setValue }) => (
              <ContextButtons
                users={(kubeconfig?.users || []) as any}
                contexts={(kubeconfig?.contexts || []) as any}
                setValue={setValue}
                chosenContext={chosenContext ?? ''}
                setChosenContext={setChosenContext}
              />
            )}
          />
        )}
        <ResourceForm.FormField
          label={t('clusters.auth-type')}
          key={t('clusters.auth-type')}
          required
          value={authenticationType}
          setValue={(type: string) => {
            onChange();
            const user = kubeconfig?.users?.[userIndex]?.user as {
              exec?: LoginCommand;
              token?: string;
            };
            if (type === 'token') {
              delete user?.exec;
              jp.value(kubeconfig, `$.users[${userIndex}].user.token`, null);
            } else if (type === 'oidc') {
              delete user?.token;
              createOIDC();
            }
            setResource({ ...kubeconfig });
            setAuthenticationType(type);
          }}
          input={({ value, setValue, accessibleName }) => (
            <AuthenticationTypeDropdown
              type={value}
              setType={setValue}
              accessibleName={accessibleName}
            />
          )}
        />
        {authenticationType === 'token' ? tokenFields : OIDCFields}
      </div>
    </ResourceForm>
  );
};

type EditClusterComponentProps = {
  formElementRef?: RefObject<HTMLFormElement>;
  onChange: () => void;
  resourceUrl?: string;
  editedCluster: Record<string, any>;
};

function EditClusterComponent({
  formElementRef,
  onChange,
  resourceUrl,
  editedCluster,
}: EditClusterComponentProps) {
  const [resource, setResource] = useState(cloneDeep(editedCluster));
  const { kubeconfig, config } = resource;

  const { t } = useTranslation();
  const notification = useNotification();

  const clustersInfo = useClustersInfo();
  const setAuth = useSetAtom(authDataAtom);
  const originalName = useRef(kubeconfig?.['current-context'] || '');

  const setWholeResource = (newKubeconfig: Kubeconfig) => {
    jp.value(resource, '$.kubeconfig', newKubeconfig);
    setResource({ ...resource });
  };

  const onComplete = () => {
    try {
      if (originalName.current !== kubeconfig?.['current-context']) {
        deleteCluster(originalName.current, clustersInfo);
      }
      const contextName = kubeconfig['current-context'];
      setAuth(null);

      addCluster(
        {
          kubeconfig,
          config: { ...(config || {}), config },
          contextName: kubeconfig?.['current-context'],
          currentContext: getContext(kubeconfig, contextName),
          name: kubeconfig?.['current-context'],
        },
        clustersInfo,
      );
    } catch (e) {
      notification.notifyError({
        content: `${t('clusters.messages.wrong-configuration')}. ${
          e instanceof Error && e?.message ? e.message : ''
        }`,
      });
      console.warn(e);
    }
  };

  return (
    <div className="edit-cluster-form">
      <ChooseStorage
        storage={resource.config?.storage}
        setStorage={(type) => {
          jp.value(resource, '$.config.storage', type);
          setResource({ ...resource });
        }}
      />
      {isOIDCExec((getUser(kubeconfig) as KubeconfigOIDCAuth)?.exec) &&
        resource.config?.storage === 'inMemory' && (
          <MessageStrip
            design="Critical"
            hideCloseButton
            className="sap-margin-top-small"
          >
            {t('clusters.storage.oidc-memory-warning')}
          </MessageStrip>
        )}
      <ResourceForm.FormField
        className="sap-margin-top-small"
        label={t('common.headers.description')}
        data-testid="cluster-description"
        input={Inputs.Text}
        placeholder={t('clusters.description-visibility')}
        value={resource.config?.description || ''}
        setValue={(value: string) => {
          jp.value(resource, '$.config.description', value);
          setResource({ ...resource });
        }}
      />
      <ClusterDataForm
        onChange={onChange}
        kubeconfig={kubeconfig}
        setResource={setWholeResource}
        onSubmit={onComplete}
        formElementRef={formElementRef}
        resourceUrl={resourceUrl}
      />
    </div>
  );
}

export function EditCluster(props: EditClusterComponentProps) {
  return (
    <ErrorBoundary>
      <EditClusterComponent {...props} />
    </ErrorBoundary>
  );
}
