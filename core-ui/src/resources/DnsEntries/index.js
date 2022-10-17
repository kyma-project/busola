import React from 'react';

export const resourceType = 'DnsEntries';
export const namespaced = true;
export const resourceI18Key = 'dnsentries.title';
export const apiGroup = 'dns.gardener.cloud';
export const apiVersion = 'v1alpha1';

export const List = React.lazy(() => import('./DnsEntryList'));
export const Details = React.lazy(() => import('./DnsEntryDetails'));
