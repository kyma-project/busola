import React from 'react';

import { usePost } from 'react-shared';
import { SecretForm } from './SecretForm';
import { useTranslation } from 'react-i18next';

export function SecretsCreate(props) {
  const { t } = useTranslation();

  const postRequest = usePost();
  const {
    onCompleted,
    onError,
    resourceUrl,
    refetchList,
    ...formProps
  } = props;
  const initialSecret = {
    metadata: { labels: {} },
    type: 'Opaque',
    data: {},
  };

  const onSubmit = async secretInput => {
    try {
      await postRequest(resourceUrl, secretInput);
      onCompleted(t('secret.created'));
      refetchList();
    } catch (e) {
      console.warn(e);
      onError(
        t('secrets.errors.cannot-create'),
        `${t('common.tooltips.error')}: ${e.message}`,
      );
    }
  };

  return (
    <SecretForm {...formProps} secret={initialSecret} onSubmit={onSubmit} />
  );
}
