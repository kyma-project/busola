import React from 'react';

import PersistentVolumeClaimsListComponent from 'resources/PersistentVolumeClaims/PersistentVolumeClaimList';

export function PersistentVolumeClaimsList(storageclass) {
  const params = {
    disableCreate: true,
    displayArrow: false,
    disableHiding: true,
    hasDetailsView: true,
    resourceUrl: `/api/v1/persistentvolumeclaims`,
    resourceType: 'PersistentVolumeClaims',
    isCompact: true,
    showTitle: true,
    filter: persistentvolumesclaim =>
      persistentvolumesclaim.spec.storageClassName ===
      storageclass.metadata.name,
  };

  return (
    <PersistentVolumeClaimsListComponent
      key="persistent-volume-claims-list"
      {...params}
    />
  );
}
