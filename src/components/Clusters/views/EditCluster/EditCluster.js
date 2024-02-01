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

export const ClusterDataForm = ({
  kubeconfig,
  setResource,
  onChange,
  onSubmit,
  resourceUrl,
  formElementRef,
  onlyYaml,
}) => {
  if (!kubeconfig) {
    kubeconfig = {};
  }

  const { t } = useTranslation();
  const [authenticationType, setAuthenticationType] = useState(
    kubeconfig?.users?.[0]?.user?.exec ? 'oidc' : 'token',
  );

  const findInitialValue = id => {
    if (kubeconfig?.users?.[0]?.user?.exec?.args) {
      const elementWithId = kubeconfig?.users?.[0]?.user?.exec?.args.find(el =>
        el.includes(id),
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

  const tokenFields = (
    <ResourceForm.FormField
      label={t('clusters.token')}
      input={Inputs.Text}
      advanced
      required
      propertyPath="$.users[0].user.token"
    />
  );

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
    jp.value(kubeconfig, '$.users[0].user.exec', exec);
    setResource({ ...kubeconfig });
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
    <ResourceForm
      pluralKind="clusters"
      singularName={t(`clusters.name_singular`)}
      resource={Object.keys(kubeconfig).length ? kubeconfig : null}
      setResource={setResource}
      initialResource={kubeconfig}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      onSubmit={onSubmit}
      autocompletionDisabled
      disableDefaultFields={true}
      onlyYaml={onlyYaml}
    >
      <K8sNameField
        kind={t('clusters.name_singular')}
        date-testid="cluster-name"
        value={jp.value(kubeconfig, '$["current-context"]')}
        setValue={name => {
          jp.value(kubeconfig, '$["current-context"]', name);
          jp.value(kubeconfig, '$.contexts[0].name', name);

          setResource({ ...kubeconfig });
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
            delete kubeconfig?.users?.[0]?.user?.exec;
            jp.value(kubeconfig, '$.users[0].user.token', null);
          } else {
            delete kubeconfig.users?.[0]?.user?.token;
            createOIDC();
          }
          setResource({ ...kubeconfig });
          setAuthenticationType(type);
        }}
        input={({ value, setValue }) => (
          <AuthenticationTypeDropdown type={value} setType={setValue} />
        )}
      />
      {authenticationType === 'token' ? tokenFields : OIDCFields}
    </ResourceForm>
  );
};

function EditClusterComponent({
  formElementRef,
  onChange,
  resourceUrl,
  editedCluster,
}) {
  const [resource, setResource] = useState(cloneDeep(editedCluster));
  const { kubeconfig, config } = resource;

  const { t } = useTranslation();
  const notification = useNotification();

  const clustersInfo = useClustersInfo();
  const setAuth = useSetRecoilState(authDataState);
  const originalName = useRef(kubeconfig?.['current-context'] || '');

  const setWholeResource = newKubeconfig => {
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
        title: t('clusters.messages.wrong-configuration'),
        content: t('common.tooltips.error') + e.message,
      });
      console.warn(e);
    }
  };

  return (
    <>
      <div
        style={{
          ...spacing.sapUiLargeMarginBeginEnd,
          ...spacing.sapUiSmallMarginTopBottom,
        }}
      >
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
          style={spacing.sapUiMediumMarginTop}
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

      <ClusterDataForm
        onChange={onChange}
        kubeconfig={kubeconfig}
        setResource={setWholeResource}
        onSubmit={onComplete}
        formElementRef={formElementRef}
        resourceUrl={resourceUrl}
      />
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
