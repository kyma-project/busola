import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';

import { ReplicaSetCreate } from './ReplicaSetCreate';
import { ReplicaSetStatus } from './ReplicaSetStatus';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/ReplicaSets';

const getImages = replicaSet => {
  const images =
    replicaSet.spec.template.spec.containers?.map(
      container => container.image,
    ) || [];
  return images;
};

export function ReplicaSetList(params) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: replicaSet => (
        <ControlledBy
          ownerReferences={replicaSet.metadata.ownerReferences}
          kindOnly
        />
      ),
    },
    {
      header: t('replica-sets.headers.images'),
      value: replicaSet => {
        const images = getImages(replicaSet);
        const imagesString = images.join(', ');
        return <span style={{ overflowWrap: 'anywhere' }}>{imagesString}</span>;
      },
    },
    {
      header: t('common.headers.pods'),
      value: replicaSet => <ReplicaSetStatus replicaSet={replicaSet} />,
    },
  ];

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('replica-sets.title')}
      description={ResourceDescription}
      {...params}
      createResourceForm={ReplicaSetCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default ReplicaSetList;
