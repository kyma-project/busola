import { Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

import { StorageClassCreate } from './StorageClassCreate';

export function StorageClassList(props) {
  const description = (
    <Trans i18nKey="storage-classes.description">
      <ExternalLink
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/storage/storage-classes/"
      />
    </Trans>
  );

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
