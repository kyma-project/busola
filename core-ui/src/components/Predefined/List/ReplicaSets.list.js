import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';
import { useTranslation, Trans } from 'react-i18next';
import { ReplicaSetsCreate } from '../Create/ReplicaSets/ReplicaSets.create';
import { ReplicaSetStatus } from '../Details/ReplicaSet/ReplicaSetStatus';

const getImages = replicaSet => {
  const images =
    replicaSet.spec.template.spec.containers?.map(
      container => container.image,
    ) || [];
  return images;
};

const ReplicaSetsList = params => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: replicaSet => (
        <ControlledByKind
          ownerReferences={replicaSet.metadata.ownerReferences}
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

  const description = (
    <Trans i18nKey="replica-sets.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceName={t('replica-sets.title')}
      description={description}
      createResourceForm={ReplicaSetsCreate}
      {...params}
    />
  );
};

export default ReplicaSetsList;
