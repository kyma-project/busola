import React, { useState } from 'react';
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
  /*
  const postRequest = usePost();
  const [spec, setSpec] = React.useState(emptySpec);
  const [useCustomSecret, setUseCustomSecret] = React.useState(false);

  const { data } = useGetList()(`/api/v1/namespaces/${namespace}/secrets/`, {
    pollingInterval: 3000,
  });
  const secretNames = data?.map(s => s.metadata.name) || [];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => setCustomValid(validateSpec(spec)), [
    spec,
    useCustomSecret,
  ]);

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!useCustomSecret) {
      spec.secretName = spec.name;
    }
    const input = createOAuthClient(namespace, spec);
    try {
      await postRequest(resourceUrl, input);
      refetchList();
      onCompleted(`OAuth2 Client ${spec.name} created`);
    } catch (e) {
      onError('Cannot create OAuth2 Client', `Error: ${e.message}`);
    }
  }

  const { i18n } = useTranslation();
  return (
    <form
      ref={formElementRef}
      onChange={onChange}
      onSubmit={handleFormSubmit}
      noValidate
    >
      <FormItem>
        <K8sNameInput
          value={spec.name}
          label="Name"
          kind="Client"
          onChange={e => setSpec({ ...spec, name: e.target.value })}
          i18n={i18n}
        />
      </FormItem>
      <FormItem className="clearfix">
        <CheckboxFormControl
          name="Response types"
          availableValues={ResponseTypes()}
          values={spec.responseTypes}
          onChange={values => setSpec({ ...spec, responseTypes: values })}
        />
      </FormItem>
      <FormItem className="clearfix">
        <CheckboxFormControl
          required={true}
          name="Grant types"
          availableValues={GrantTypes()}
          values={spec.grantTypes}
          onChange={values => setSpec({ ...spec, grantTypes: values })}
        />
      </FormItem>
      <FormItem>
        <FormLabel htmlFor="scope" required className="fd-has-display-block">
          Scopes
        </FormLabel>
        <StringInput
          stringList={spec.scope.split(' ').filter(scope => scope)}
          onChange={scope => setSpec({ ...spec, scope: scope.join(' ') })}
          id="scope"
          required
          i18n={i18n}
        />
      </FormItem>
      <p
        className="link fd-has-display-block fd-margin-top--sm"
        onClick={() => setUseCustomSecret(!useCustomSecret)}
      >
        {useCustomSecret
          ? 'Create secret with the same name as client.'
          : 'Define custom secret name for this client.'}
      </p>
      {useCustomSecret && (
        <>
          <FormItem>
            <K8sNameInput
              label="Secret name"
              kind="Secret"
              onChange={e => setSpec({ ...spec, secretName: e.target.value })}
              value={spec.secretName}
              i18n={i18n}
            />
          </FormItem>
          <p className="fd-has-display-block fd-has-color-status-4">
            {secretNames?.includes(spec.secretName) &&
              `Secret "${spec.secretName}" exists and will be used for this client.`}
          </p>
        </>
      )}
    </form>
  );
    */
};
