import React from 'react';

export const resourceType = 'Certificates';
export const namespaced = true;
export const apiGroup = 'cert.gardener.cloud';
export const apiVersion = 'v1alpha1';

export const List = React.lazy(() => import('./CertificateList'));
export const Details = React.lazy(() => import('./CertificateDetails'));
