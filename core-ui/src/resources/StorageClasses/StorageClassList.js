import React from 'react';
import { Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';

import { StorageClassCreate } from './StorageClassCreate';

export function StorageClassList(props) {
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
      {...props}
      description={description}
      createResourceForm={StorageClassCreate}
    />
  );
}

export default StorageClassList;
