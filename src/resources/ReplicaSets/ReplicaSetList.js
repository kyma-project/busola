import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';

import { ReplicaSetCreate } from './ReplicaSetCreate';
import { ReplicaSetStatus } from './ReplicaSetStatus';

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

  const description = (
    <Trans i18nKey="replica-sets.description">
      <Link
        className="bsl-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceTitle={t('replica-sets.title')}
      description={description}
      {...params}
      createResourceForm={ReplicaSetCreate}
    />
  );
}

export default ReplicaSetList;
