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
}) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [secret, setSecret] = useState(
    createSecretTemplate({ existingSecret, namespaceId }),
  );
  const [isEncoded, setEncoded] = useState(false);
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
        title: t('secrets.create-modal.messages.failure'),
        content: e.message,
      });
      return false;
    }
  };

  return (
    <CreateForm
      title={t('secrets.create-modal.title')}
      simpleForm={
        <SimpleForm
          secret={secret}
          setSecret={setSecret}
          isEncoded={isEncoded}
          setEncoded={setEncoded}
        />
      }
      advancedForm={
        <AdvancedForm
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
      onCreate={createSecret}
      onChange={onChange}
      presets={createPresets(namespaceId, t, DNSExist)}
      formElementRef={formElementRef}
    />
  );
}
