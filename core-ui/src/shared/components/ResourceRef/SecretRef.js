import React from 'react';
import { useGetList } from 'react-shared';

import { ExternalResourceRef } from './ExternalResourceRef';

const SECRETS_URL = '/api/v1/secrets';

export function SecretRef({ labelSelector, ...props }) {
  const url = labelSelector
    ? `${SECRETS_URL}?labelSelector=${labelSelector}`
    : SECRETS_URL;

  const { data: secrets } = useGetList()(url);
  return <ExternalResourceRef resources={secrets} {...props} />;
}
