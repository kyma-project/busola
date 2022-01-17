import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function PersistentVolumeClaimsList(storageclass) {
  const params = {
    fixedPath: true,
    resourceUrl: `/api/v1/persistentvolumeclaims`,
    resourceType: 'PersistentVolumeClaims',
    isCompact: true,
    showTitle: true,
    filter: persistentvolumesclaim =>
      persistentvolumesclaim.spec.storageClassName ===
      storageclass.metadata.name,
  };

  return (
    <ComponentForList
      name="persistentVolumeClaimsList"
      params={params}
      key="persistentvolumeclaims"
    />
  );
}
