import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { TextArrayInput } from 'shared/ResourceForm/components/FormComponents';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import {
  K8sNameField,
  KeyValueField,
} from 'shared/ResourceForm/components/FormComponents';

import { createOAuth2ClientTemplate } from './helpers';

const OAuth2ClientsCreate = ({
  namespace,
  formElementRef,
  onChange,
  onCompleted,
  onError,
  resource: initialOAuth2Client,
  resourceUrl,
  refetchList,
  setCustomValid,
}) => {
  const { t } = useTranslation();

  const [oAuth2Client, setOAuth2Client] = useState(
    initialOAuth2Client || createOAuth2ClientTemplate(namespace),
  );

  return (
    <ResourceForm
      className="create-oauth2-client-form"
      pluralKind="oauth2clients"
      singularName={t('oauth2-clients.name_singular')}
      resource={oAuth2Client}
      initialResource={initialOAuth2Client}
      setResource={setOAuth2Client}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('oauth2-clients.name_singular')}
        setValue={name => {
          jp.value(oAuth2Client, '$.metadata.name', name);
          jp.value(
            oAuth2Client,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          jp.value(oAuth2Client, '$.spec.secretName', name);
          setOAuth2Client({ ...oAuth2Client });
        }}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.responseTypes"
        validate={val => val?.length}
        label={t('oauth2-clients.labels.response-types')}
        input={Inputs.Checkboxes}
        options={['id_token', 'code', 'token'].map(type => ({
          key: type,
          text: t(`oauth2-clients.response-types.${type}`),
        }))}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.grantTypes"
        validate={val => val?.length}
        label={t('oauth2-clients.labels.grant-types')}
        input={Inputs.Checkboxes}
        options={[
          'client_credentials',
          'authorization_code',
          'implicit',
          'refresh_token',
        ].map(type => ({
          key: type,
          text: t(`oauth2-clients.grant-types.${type}`),
        }))}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.clientName"
        label={t('oauth2-clients.labels.client-name')}
        tooltipContent={t('oauth2-clients.tooltips.client-name')}
        input={Inputs.Text}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.secretName"
        label={t('oauth2-clients.labels.secret-name')}
        tooltipContent={t('oauth2-clients.tooltips.secret-name')}
        input={({ value, setValue }) => (
          <K8sResourceSelectWithUseGetList
            compact
            required
            value={value}
            resourceType={t('oauth2-clients.labels.secret')}
            onSelect={setValue}
            url={`/api/v1/namespaces/${namespace}/secrets`}
          />
        )}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.spec.tokenEndpointAuthMethod"
        label={t('oauth2-clients.labels.auth-method')}
        input={Inputs.Dropdown}
        options={[
          {
            key: 'none',
            text: t('oauth2-clients.auth-methods.none'),
          },
          {
            key: 'client_secret_basic',
            text: t('oauth2-clients.auth-methods.client_secret_basic'),
          },
          {
            key: 'client_secret_post',
            text: t('oauth2-clients.auth-methods.client_secret_post'),
          },
          {
            key: 'private_key_jwt',
            text: t('oauth2-clients.auth-methods.private_key_jwt'),
          },
        ]}
      />
      <TextArrayInput
        required
        defaultOpen
        propertyPath="$.spec.scope"
        validate={val => !!val}
        title={t('oauth2-clients.labels.scope')}
        toInternal={value => value?.split(/ +/) || []}
        toExternal={value => value.filter(Boolean).join(' ')}
        placeholder={t('oauth2-clients.placeholders.scope')}
      />
      <TextArrayInput
        advanced
        propertyPath="$.spec.redirectUris"
        title={t('oauth2-clients.labels.redirect-uris')}
        inputProps={{ type: 'url' }}
      />
      <TextArrayInput
        advanced
        propertyPath="$.spec.postLogoutRedirectUris"
        title={t('oauth2-clients.labels.post-logout-redirect-uris')}
        inputProps={{ type: 'url' }}
      />
      <TextArrayInput
        advanced
        propertyPath="$.spec.audience"
        title={t('oauth2-clients.labels.audience')}
        tooltipContent={t('oauth2-clients.tooltips.audience')}
      />
    </ResourceForm>
  );
};
OAuth2ClientsCreate.secrets = (t, context) => [
  {
    title: t('oauth2-clients.secret'),
    data: ['client_id', 'client_secret'],
  },
];
export { OAuth2ClientsCreate };
