import React from 'react';

import { CreateDNSEntryForm } from './CreateDNSEntryForm';

export function DNSEntriesCreate(props) {
  return <CreateDNSEntryForm namespaceId={props.namespace} {...props} />;
}
