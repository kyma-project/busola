import React from 'react';
import { createPatch } from 'rfc6902';
import { useTranslation } from 'react-i18next';

import { useUpdate, useNotification } from 'react-shared';
import { CreateSecretForm } from '../../Create/Secrets/CreateSecretForm';

export function EditSecretForm(props) {
  const { t } = useTranslation();
  const patchRequest = useUpdate();
  const notification = useNotification();

  const { secret, resourceUrl, ...formProps } = props;

  const onSubmit = async secretInput => {
    const mergedSecret = {
      ...secret,
      ...secretInput,
      metadata: { ...secret.metadata, ...secretInput.metadata },
    };
    try {
      await patchRequest(resourceUrl, createPatch(secret, mergedSecret));
      notification.notifySuccess({
        content: t('secrets.edit-modal.messages.success'),
      });
    } catch (e) {
      console.warn(e);
      notification.notifyError({
        content: t('secrets.edit-modal.messages.failure', { error: e.message }),
      });
    }
  };

  return (
    <CreateSecretForm
      {...formProps}
      secret={secret}
      onSubmit={onSubmit}
      isEncoded={true}
    />
  );
}
