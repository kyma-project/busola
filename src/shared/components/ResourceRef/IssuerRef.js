import React from 'react';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useTranslation } from 'react-i18next';

import { ExternalResourceRef } from './ExternalResourceRef';

export function IssuerRef(props) {
  const { t } = useTranslation();
  const { data: issuers, loading } = useGetList()(
    '/apis/cert.gardener.cloud/v1alpha1/issuers',
  );

  return (
    <ExternalResourceRef
      resources={issuers}
      loading={loading}
      labelPrefix={t('common.labels.issuer')}
      {...props}
    />
  );
}
