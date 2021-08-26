import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';

import { usePost, useNotification } from 'react-shared';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import {
  secretToYaml,
  yamlToSecret,
  createSecretTemplate,
  createPresets,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function CreateSecretForm({ namespaceId, modalOpeningComponent }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [secret, setSecret] = React.useState(createSecretTemplate(namespaceId));
  const [isEncoded, setEncoded] = React.useState(false);

  modalOpeningComponent = modalOpeningComponent || (
    <Button glyph="add">{t('secrets.create-modal.title')}</Button>
  );

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
    <CreateModal
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
      modalOpeningComponent={modalOpeningComponent}
      resource={secret}
      setResource={setSecret}
      onClose={() => setSecret(createSecretTemplate(namespaceId))}
      toYaml={secret => secretToYaml({ secret, isEncoded })}
      fromYaml={yamlToSecret}
      onCreate={createSecret}
      presets={createPresets(namespaceId, t)}
    />
  );
}
