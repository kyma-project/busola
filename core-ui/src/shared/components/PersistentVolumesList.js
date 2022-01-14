import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function PersistentVolumesList(storageclass) {
  const params = {
    // Uncoment and check flow after resolve issue #537
    // hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/persistentvolumes`,
    resourceType: 'persistentvolumes',
    isCompact: true,
    showTitle: true,
    filter: persistentvolumes =>
      persistentvolumes.spec.storageClassName === storageclass.metadata.name,
  };

  return (
    <ComponentForList
      name="persistenvolumesList"
      params={params}
      key="persistentvolumes"
    />
  );
}
