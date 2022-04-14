import React from 'react';

export const resourceType = 'Certificates';
export const namespaced = true;

export const List = React.lazy(() => import('./CertificateList'));
export const Details = React.lazy(() => import('./CertificateDetails'));
