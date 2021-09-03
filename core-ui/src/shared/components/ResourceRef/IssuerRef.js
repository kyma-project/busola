import React from 'react';
import { useGetList } from 'react-shared';

import { ExternalResourceRef } from './ExternalResourceRef';

export function IssuerRef(props) {
  const { data: issuers } = useGetList()(
    '/apis/cert.gardener.cloud/v1alpha1/issuers',
  );
  return <ExternalResourceRef resources={issuers} {...props} />;
}
