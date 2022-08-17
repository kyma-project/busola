import React from 'react';
import LuigiClient from '@luigi-project/client';

import PersistentVolumesListComponent from 'resources/PersistentVolumes/PersistentVolumeList';

export function PersistentVolumesList(storageclass) {
  const navigateFn = resource => {
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(`/persistentvolumes/details/${resource.metadata.name}`);
  };

  const params = {
    hasDetailsView: true,
    navigateFn,
    fixedPath: true,
    resourceUrl: `/api/v1/persistentvolumes`,
    resourceType: 'PersistentVolumes',
    isCompact: true,
    showTitle: true,
    filter: persistentvolumes =>
      persistentvolumes.spec.storageClassName === storageclass.metadata.name,
  };

  return <PersistentVolumesListComponent {...params} />;
}
