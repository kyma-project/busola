import React from 'react';
import LuigiClient from '@luigi-project/client';

import { ComponentForList } from 'shared/getComponents';

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

  return (
    <ComponentForList
      name="persistentVolumesList"
      params={params}
      key="persistentvolumes"
    />
  );
}
