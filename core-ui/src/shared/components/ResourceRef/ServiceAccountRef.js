import React from 'react';
import { useGetList } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ExternalResourceRef } from './ExternalResourceRef';

export function ServiceAccountRef(props) {
  const { t } = useTranslation();
  const { data: serviceaccounts } = useGetList()('/api/v1/serviceaccounts/');

  return (
    <ExternalResourceRef
      resources={serviceaccounts}
      labelPrefix={t('role-bindings.labels.service-account')}
      {...props}
    />
  );
}
