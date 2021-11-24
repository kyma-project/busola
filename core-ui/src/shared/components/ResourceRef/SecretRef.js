import React from 'react';
import { useGetList } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ExternalResourceRef } from './ExternalResourceRef';

export function SecretRef({ fieldSelector, labelSelector, ...props }) {
  const { t } = useTranslation();
  const url = `/api/v1/secrets?labelSelector=${labelSelector ||
    ''}&fieldSelector=${fieldSelector || ''}`;
  const { data: secrets, loading } = useGetList()(url);

  return (
    <ExternalResourceRef
      defaultOpen={true}
      resources={secrets}
      loading={loading}
      labelPrefix={t('common.labels.secret')}
      {...props}
    />
  );
}
