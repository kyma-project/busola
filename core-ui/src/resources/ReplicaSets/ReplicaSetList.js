import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

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
      <ExternalLink
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
      createResourceForm={ReplicaSetCreate}
      {...params}
    />
  );
}

export default ReplicaSetList;
