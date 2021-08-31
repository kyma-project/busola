import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';

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
  existingSecret,
  onSubmit,
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [secret, setSecret] = useState(
    existingSecret
      ? yamlToSecret(existingSecret)
      : createSecretTemplate(namespaceId),
  );
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
}
