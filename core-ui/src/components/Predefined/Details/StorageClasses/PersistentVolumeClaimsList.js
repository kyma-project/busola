import React from 'react';
import LuigiClient from '@luigi-project/client';

import PersistentVolumeClaimsListComponent from 'components/Predefined/List/PersistentVolumeClaims.list';
import { useTranslation } from 'react-i18next';
export function PersistentVolumeClaimsList(storageclass) {
  const navigateFn = resource => {
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(
        `namespaces/${resource.metadata.namespace}/persistentvolumeclaims/details/${resource.metadata.name}`,
      );
  };
  const { i18n } = useTranslation();
  const params = {
    hasDetailsView: true,
    navigateFn,
    resourceUrl: `/api/v1/persistentvolumeclaims`,
    resourceType: 'PersistentVolumeClaims',
    isCompact: true,
    showTitle: true,
    filter: persistentvolumesclaim =>
      persistentvolumesclaim.spec.storageClassName ===
      storageclass.metadata.name,
    i18n,
  };

  return <PersistentVolumeClaimsListComponent {...params} />;
}
