import React from 'react';
import { useUpdate } from 'react-shared';
import { SecretForm } from '../../Create/Secrets/SecretForm';
import { createPatch } from 'rfc6902';
import { useTranslation } from 'react-i18next';

export function EditSecretForm(props) {
  const { t } = useTranslation();

  const patchRequest = useUpdate();
  const { secret, onCompleted, onError, resourceUrl, ...formProps } = props;

  const onSubmit = async secretInput => {
    const mergedSecret = {
      ...secret,
      ...secretInput,
      metadata: { ...secret.metadata, ...secretInput.metadata },
    };
    try {
      await patchRequest(resourceUrl, createPatch(secret, mergedSecret));
      onCompleted(t('secrets.messages.created'));
    } catch (e) {
      console.warn(e);
      onError(
        t('secrets.errors.cannot-create'),
        `${t('common.tooltips.error')} ${e.message}`,
      );
    }
  };

  return <SecretForm {...formProps} secret={secret} onSubmit={onSubmit} />;
}
