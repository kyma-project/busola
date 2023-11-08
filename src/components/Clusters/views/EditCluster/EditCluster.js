import React, { useState, useRef } from 'react';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField } from 'shared/ResourceForm/fields';
import { ChooseStorage } from 'components/Clusters/components/ChooseStorage';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { useNotification } from 'shared/contexts/NotificationContext';
import * as Inputs from 'shared/ResourceForm/inputs';
import { AuthenticationTypeDropdown } from 'components/Clusters/views/EditCluster/AuthenticationDropdown';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { authDataState } from 'state/authDataAtom';
import { Title } from '@ui5/webcomponents-react';

import { addCluster, getContext, deleteCluster } from '../../shared';

import { spacing } from '@ui5/webcomponents-react-base';

function EditClusterComponent({
  formElementRef,
  onChange,
  resourceUrl,
  editedCluster,
}) {
  const clustersInfo = useClustersInfo();
  const setAuth = useSetRecoilState(authDataState);
  const [resource, setResource] = useState(cloneDeep(editedCluster));
  const [authenticationType, setAuthenticationType] = useState(
    resource?.kubeconfig?.users?.[0]?.user?.exec ? 'oidc' : 'token',
  );
  const notification = useNotification();

  const { kubeconfig, config } = resource;

  const originalName = useRef(resource?.kubeconfig?.['current-context'] || '');

  const onComplete = () => {
    try {
      if (originalName.current !== resource?.kubeconfig?.['current-context']) {
        deleteCluster(originalName.current, clustersInfo);
      }
      const contextName = kubeconfig['current-context'];
      setAuth(null);

      addCluster(
        {
          kubeconfig,
          config: { ...(config || {}), config },
          contextName: resource?.kubeconfig?.['current-context'],
          currentContext: getContext(kubeconfig, contextName),
          name: resource?.kubeconfig?.['current-context'],
        },
        clustersInfo,
      );
    } catch (e) {
      notification.notifyError({
        title: t('clusters.messages.wrong-configuration'),
        content: t('common.tooltips.error') + e.message,
      });
      console.warn(e);
    }
  };

  const { t } = useTranslation();

  const tokenFields = (
    <ResourceForm.FormField
      label={t('clusters.token')}
      input={Inputs.Text}
      advanced
      required
      propertyPath="$.users[0].user.token"
    />
  );

  const findInitialValue = id => {
    if (resource?.kubeconfig?.users?.[0]?.user?.exec?.args) {
      const elementWithId = resource.kubeconfig?.users?.[0]?.user?.exec?.args.find(
        el => el.includes(id),
      );
      const regex = new RegExp(`${id}=(?<value>.*)`);
      return regex.exec(elementWithId)?.groups?.value || '';
    }
    return '';
  };
  const [issuerUrl, setIssuerUrl] = useState(
    findInitialValue('oidc-issuer-url'),
  );
  const [clientId, setClientId] = useState(findInitialValue('oidc-client-id'));
  const [clientSecret, setClientSecret] = useState(
    findInitialValue('oidc-client-secret'),
  );
  const [scopes, setScopes] = useState(findInitialValue('oidc-extra-scope'));
  const createOIDC = (type = '', val = '') => {
    const config = { issuerUrl, clientId, clientSecret, scopes, [type]: val };
    const exec = {
      apiVersion: 'client.authentication.k8s.io/v1beta1',
      command: 'kubectl',
      args: [
        'oidc-login',
        'get-token',
        `--oidc-issuer-url=${config.issuerUrl}`,
        `--oidc-client-id=${config.clientId}`,
        `--oidc-client-secret=${config.clientSecret}`,
        `--oidc-extra-scope=openid ${config.scopes}`,
        '--grant-type=auto',
      ],
    };
    jp.value(resource, '$.kubeconfig.users[0].user.exec', exec);
    setResource({ ...resource });
  };
  const OIDCFields = (
    <>
      <ResourceForm.FormField
        label={t('clusters.labels.issuer-url')}
        input={Inputs.Text}
        advanced
        required
        value={issuerUrl}
        setValue={val => {
          setIssuerUrl(val);
          createOIDC('issuerUrl', val);
        }}
      />
      <ResourceForm.FormField
        label={t('clusters.labels.client-id')}
        input={Inputs.Text}
        advanced
        required
        value={clientId}
        setValue={val => {
          setClientId(val);
          createOIDC('clientId', val);
        }}
      />
      <ResourceForm.FormField
        label={t('clusters.labels.client-secret')}
        input={Inputs.Text}
        advanced
        value={clientSecret}
        setValue={val => {
          setClientSecret(val);
          createOIDC('clientSecret', val);
        }}
      />
      <ResourceForm.FormField
        label={t('clusters.labels.scopes')}
        input={Inputs.Text}
        advanced
        required
        value={scopes}
        setValue={val => {
          setScopes(val);
          createOIDC('scopes', val);
        }}
      />
    </>
  );

  return (
    <>
      <div style={spacing.sapUiMediumMarginBeginEnd}>
        <Title level="H3" style={spacing.sapUiSmallMarginBottom}>
          {t('clusters.storage.choose-storage.label')}
        </Title>
        <ChooseStorage
          storage={resource.config?.storage}
          setStorage={type => {
            jp.value(resource, '$.config.storage', type);
            setResource({ ...resource });
          }}
        />
        <ResourceForm.FormField
          label={t('common.headers.description')}
          data-testid="cluster-description"
          input={Inputs.Text}
          placeholder={t('clusters.description-visibility')}
          value={resource.config?.description || ''}
          setValue={value => {
            jp.value(resource, '$.config.description', value);
            setResource({ ...resource });
          }}
        />
      </div>

      <ResourceForm
        pluralKind="clusters"
        singularName={t(`clusters.name_singular`)}
        resource={resource.kubeconfig}
        setResource={modified => {
          jp.value(resource, '$.kubeconfig', modified);
          setResource({ ...resource });
        }}
        initialResource={resource.kubeconfig}
        onChange={onChange}
        formElementRef={formElementRef}
        createUrl={resourceUrl}
        onSubmit={onComplete}
        autocompletionDisabled
        disableDefaultFields={true}
      >
        <K8sNameField
          kind={t('clusters.name_singular')}
          date-testid="cluster-name"
          value={jp.value(resource, '$.kubeconfig["current-context"]')}
          setValue={name => {
            jp.value(resource, '$.kubeconfig["current-context"]', name);
            jp.value(resource, '$.kubeconfig.contexts[0].name', name);

            setResource({ ...resource });
          }}
        />
        <ResourceForm.FormField
          label={t('clusters.auth-type')}
          key={t('clusters.auth-type')}
          required
          advanced
          value={authenticationType}
          setValue={type => {
            if (type === 'token') {
              delete resource?.kubeconfig?.users?.[0]?.user?.exec;
              jp.value(resource, '$.kubeconfig.users[0].user.token', '');
            } else {
              delete resource?.kubeconfig.users?.[0]?.user?.token;
              createOIDC();
            }
            setResource({ ...resource });
            setAuthenticationType(type);
          }}
          input={({ value, setValue }) => (
            <AuthenticationTypeDropdown type={value} setType={setValue} />
          )}
        />
        {authenticationType === 'token' ? tokenFields : OIDCFields}
      </ResourceForm>
    </>
  );
}

export function EditCluster(props) {
  return (
    <ErrorBoundary>
      <EditClusterComponent {...props} />
    </ErrorBoundary>
  );
}
