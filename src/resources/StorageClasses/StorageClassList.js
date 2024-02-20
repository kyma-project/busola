import React from 'react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import { StorageClassCreate } from './StorageClassCreate';
import { description } from 'resources/StorageClasses/StorageClassDescription';

export function StorageClassList(props) {
  return (
    <ResourcesList
      {...props}
      description={description}
      createResourceForm={StorageClassCreate}
      emptyListProps={{
        subtitleText: 'storage-classes.description',
        url: 'https://kubernetes.io/docs/concepts/storage/storage-classes/',
      }}
    />
  );
}

export default StorageClassList;
