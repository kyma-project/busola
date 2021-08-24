import React from 'react';
import LuigiClient from '@luigi-project/client';
import { CreateModal } from 'shared/components/CreateModal/CreateModal';
import { Button } from 'fundamental-react';
import { usePost, useNotification } from 'react-shared';
import {
  secretToYaml,
  yamlToSecret,
  createSecretTemplate,
  createPresets,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';
import { useTranslation } from 'react-i18next';

export function CreateSecretForm({ namespaceId, modalOpeningComponent }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [secret, setSecret] = React.useState(createSecretTemplate(namespaceId));

  modalOpeningComponent = modalOpeningComponent || (
    <Button glyph="add">{t('secrets.create-modal.title')}</Button>
  );

  const createSecret = async () => {
    let createdSecret = null;
    try {
      createdSecret = await postRequest(
        `/api/v1/namespaces/${namespaceId}/secrets/`,
        secretToYaml(secret),
      );
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
      simpleForm={<SimpleForm secret={secret} setSecret={setSecret} />}
      advancedForm={<AdvancedForm secret={secret} setSecret={setSecret} />}
      modalOpeningComponent={modalOpeningComponent}
      resource={secret}
      setResource={setSecret}
      onClose={() => setSecret(createSecretTemplate(namespaceId))}
      toYaml={secretToYaml}
      fromYaml={yamlToSecret}
      onCreate={createSecret}
      presets={createPresets(namespaceId, t)}
    />
  );
}
