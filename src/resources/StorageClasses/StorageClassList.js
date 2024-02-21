import React from 'react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import { StorageClassCreate } from './StorageClassCreate';
import { Description } from 'shared/components/Description/Description';
import {
  storageClassDocsURL,
  storageClassI18nDescriptionKey,
} from 'resources/StorageClasses/index';

export function StorageClassList(props) {
  return (
    <ResourcesList
      {...props}
      description={
        <Description
          i18nKey={storageClassI18nDescriptionKey}
          url={storageClassDocsURL}
        />
      }
      createResourceForm={StorageClassCreate}
      emptyListProps={{
        subtitleText: 'storage-classes.description',
        url: 'https://kubernetes.io/docs/concepts/storage/storage-classes/',
      }}
    />
  );
}

export default StorageClassList;
