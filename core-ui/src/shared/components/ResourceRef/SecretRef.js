import React from 'react';
import { useGetList } from 'react-shared';

import { ExternalResourceRef } from './ExternalResourceRef';

export function SecretRef({ fieldSelector, labelSelector, ...props }) {
  const url = `/api/v1/secrets?labelSelector=${labelSelector ||
    ''}&fieldSelector=${fieldSelector || ''}`;
  const { data: secrets } = useGetList()(url);
  return <ExternalResourceRef resources={secrets} {...props} />;
}
