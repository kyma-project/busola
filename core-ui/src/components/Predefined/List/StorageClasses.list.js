import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
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
