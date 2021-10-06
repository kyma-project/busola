import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';
import { Button, FormInput } from 'fundamental-react';
import { Tooltip } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import {
  MultiInput,
  K8sNameField,
  KeyValueField,
} from 'shared/ResourceForm/components/FormComponents';

import {
  usePost,
  useNotification,
  useMicrofrontendContext,
} from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import {
  secretToYaml,
  yamlToSecret,
  createSecretTemplate,
  createPresets,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function CreateSecretForm({
  namespaceId,
  formElementRef,
  onChange,
  secret: existingSecret,
  onSubmit,
}) {
  const { t } = useTranslation();
  const [secret, setSecret] = useState(
    existingSecret || createSecretTemplate(namespaceId),
  );
  /*
  const notification = useNotification();
  const postRequest = usePost();
  const [isEncoded, setEncoded] = useState(!!existingSecret);
  const microfrontendContext = useMicrofrontendContext();
  const { features } = microfrontendContext;
  const DNSExist = features?.CUSTOM_DOMAINS?.isEnabled;

  const createSecret = async () => {
    try {
      await postRequest(
        `/api/v1/namespaces/${namespaceId}/secrets/`,
        secretToYaml({ secret, isEncoded }),
      );
      notification.notifySuccess({
        content: t('secrets.create-modal.messages.success'),
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/secrets/details/${secret.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('secrets.create-modal.messages.failure', {
          error: e.message,
        }),
      });
      return false;
    }
  };

  return (
    <CreateForm
      title={t('secrets.create-modal.title')}
      editMode={!!existingSecret}
      simpleForm={
        <SimpleForm
          editMode={!!existingSecret}
          secret={secret}
          setSecret={setSecret}
        />
      }
      advancedForm={
        <AdvancedForm
          editMode={!!existingSecret}
          secret={secret}
          setSecret={setSecret}
          isEncoded={isEncoded}
          setEncoded={setEncoded}
        />
      }
      resource={secret}
      setResource={setSecret}
      toYaml={secret => secretToYaml({ secret, isEncoded })}
      fromYaml={yamlToSecret}
      onCreate={
        onSubmit
          ? () => onSubmit(secretToYaml({ secret, isEncoded }))
          : createSecret
      }
      onChange={onChange}
      presets={createPresets(namespaceId, t, DNSExist)}
      formElementRef={formElementRef}
    />
  );
  */
  return (
    <ResourceForm resource={secret} setResource={setSecret}>
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('secrets.name_singular')}
        setValue={name => {
          jp.value(secret, '$.metadata.name', name);
          jp.value(secret, "$.metadata.labels['app.kubernetes.io/name']", name);
          setSecret(secret);
        }}
      />
      {/*
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      */}
      <MultiInput
        propertyPath="$.metadata.data"
        toInternal={value =>
          Object.entries(value || {}).map(([key, val]) => ({ key, val }))
        }
        toExternal={value =>
          value
            .filter(entry => !!entry?.key)
            .reduce((acc, entry) => ({ ...acc, [entry.key]: entry.val }), {})
        }
        inputs={[
          ({ value, setValue, ref, onBlur, focus }) => (
            <FormInput
              compact
              key="key"
              value={value?.key || ''}
              ref={ref}
              onChange={e =>
                setValue({ val: value?.val || '', key: e.target.value })
              }
              onKeyDown={e => focus(e, 1)}
              onBlur={onBlur}
              placeholder={t('components.key-value-field.enter-key')}
            />
          ),
          ({ value, setValue, ref, onBlur, focus }) => (
            <FormInput
              compact
              key="value"
              value={value?.val || ''}
              ref={ref}
              onChange={e => setValue({ ...value, val: e.target.value })}
              onKeyDown={e => focus(e)}
              onBlur={onBlur}
              placeholder={t('components.key-value-field.enter-value')}
            />
          ),
          () => (
            <Tooltip content={t('common.tooltips.read-file')}>
              <Button>{t('components.key-value-form.read-value')}</Button>
            </Tooltip>
          ),
        ]}
      />
    </ResourceForm>
  );
}
