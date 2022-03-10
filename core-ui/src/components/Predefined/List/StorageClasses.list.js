import React from 'react';
import { Link, ResourcesList } from 'react-shared';
import { StorageClassesCreate } from '../Create/StorageClasses/StorageClasses.create';
import { Trans } from 'react-i18next';

const StorageClassesList = props => {
  const description = (
    <Trans i18nKey="storage-classes.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/storage/storage-classes/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      description={description}
      {...props}
      createResourceForm={StorageClassesCreate}
    />
  );
};

export default StorageClassesList;
