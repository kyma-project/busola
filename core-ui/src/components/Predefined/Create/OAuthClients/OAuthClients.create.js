import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { TextArrayInput } from 'shared/ResourceForm/components/FormComponents';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import {
  K8sNameField,
  KeyValueField,
} from 'shared/ResourceForm/components/FormComponents';

import { FormRadioGroup, Checkbox } from 'fundamental-react';
import { createOAuth2ClientTemplate } from './helpers';

function Checkboxes({ value, setValue, options, inline }) {
  const updateValue = (key, checked) => {
    if (checked) {
      setValue([...(value || []), key]);
    } else {
      setValue(value.filter(v => v !== key));
    }
  };

  return (
    <FormRadioGroup inline={inline} className="inline-radio-group">
      {options.map(({ key, text }) => (
        <Checkbox
          compact
          key={key}
          value={key}
          checked={value?.includes(key)}
          onChange={e => updateValue(key, e.target.checked)}
        >
          {text}
        </Checkbox>
      ))}
    </FormRadioGroup>
  );
}

export const OAuth2ClientsCreate = ({
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

  useEffect(() => {
    const responseTypes = jp.value(oAuth2Client, '$.spec.responseTypes');
    const grantTypes = jp.value(oAuth2Client, '$.spec.grantTypes');
    const scope = jp.value(oAuth2Client, '$.spec.scope');

    setCustomValid(responseTypes?.length && grantTypes?.length && scope);
  }, [oAuth2Client]);

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
        label={t('oauth2-clients.labels.response-types')}
        input={Checkboxes}
        options={[
          {
            key: 'id_token',
            text: t('oauth2-clients.response-types.id-token'),
          },
          {
            key: 'code',
            text: t('oauth2-clients.response-types.code'),
          },
          {
            key: 'token',
            text: t('oauth2-clients.response-types.token'),
          },
        ]}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.grantTypes"
        label={t('oauth2-clients.labels.grant-types')}
        input={Checkboxes}
        options={[
          {
            key: 'client_credentials',
            text: t('oauth2-clients.grant-types.client-credentials'),
          },
          {
            key: 'authorization_code',
            text: t('oauth2-clients.grant-types.authorization-code'),
          },
          {
            key: 'implicit',
            text: t('oauth2-clients.grant-types.implicit'),
          },
          {
            key: 'refresh_token',
            text: t('oauth2-clients.grant-types.refresh-token'),
          },
        ]}
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
        input={Inputs.Text}
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
        propertyPath="$.spec.scope"
        title={t('oauth2-clients.labels.scope')}
        toInternal={value => value?.split(/,/) || []}
        toExternal={value => value.filter(Boolean).join(',')}
      />
      <TextArrayInput
        advanced
        propertyPath="$.spec.redirectUris"
        title={t('oauth2-clients.labels.redirect-uris')}
      />
      <TextArrayInput
        advanced
        propertyPath="$.spec.postLogoutRedirectUris"
        title={t('oauth2-clients.labels.post-logout-redirect-uris')}
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
