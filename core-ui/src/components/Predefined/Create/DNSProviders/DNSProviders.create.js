import React from 'react';

import { CreateDNSProviderForm } from './CreateDNSProviderForm';

export function DNSProvidersCreate(props) {
  return <CreateDNSProviderForm namespaceId={props.namespace} {...props} />;
}
