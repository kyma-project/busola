import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function PersistentVolumeClaimsList(storageclass) {
  const params = {
    // Uncoment and check flow after resolve issue #531
    // hasDetailsView: true,
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
      name="persistenvolumeclaimsList"
      params={params}
      key="persistentvolumeclaims"
    />
  );
}
