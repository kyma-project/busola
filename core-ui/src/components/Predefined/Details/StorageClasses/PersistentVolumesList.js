import React from 'react';
import LuigiClient from '@luigi-project/client';

import PersistentVolumesListComponent from 'components/Predefined/List/PersistentVolumes.list';
import { useTranslation } from 'react-i18next';

export function PersistentVolumesList(storageclass) {
  const navigateFn = resource => {
    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(`/persistentvolumes/details/${resource.metadata.name}`);
  };

  const { i18n } = useTranslation();
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
    i18n,
  };

  return <PersistentVolumesListComponent {...params} />;
}
