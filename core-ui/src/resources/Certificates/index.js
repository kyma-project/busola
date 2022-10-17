import React from 'react';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'Certificates';
export const namespaced = true;
export const apiGroup = 'cert.gardener.cloud';
export const apiVersion = 'v1alpha1';
export const category = PredefinedCategories.configuration;

export const List = React.lazy(() => import('./CertificateList'));
export const Details = React.lazy(() => import('./CertificateDetails'));
