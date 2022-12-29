import React from 'react';

import PersistentVolumeClaimsListComponent from 'resources/PersistentVolumeClaims/PersistentVolumeClaimList';

export function PersistentVolumeClaimsList(storageclass) {
  const params = {
    hasDetailsView: true,
    resourceUrl: `/api/v1/persistentvolumeclaims`,
    resourceType: 'PersistentVolumeClaims',
    isCompact: true,
    showTitle: true,
    filter: persistentvolumesclaim =>
      persistentvolumesclaim.spec.storageClassName ===
      storageclass.metadata.name,
  };

  return <PersistentVolumeClaimsListComponent {...params} />;
}
