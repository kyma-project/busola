import React from 'react';
import { ControlledByKind, StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';

const getImages = replicaSet => {
  const images =
    replicaSet.spec.template.spec.containers?.map(
      container => container.image,
    ) || [];
  return images;
};

const isStatusOk = replicaSet => {
  return replicaSet.status.readyReplicas === replicaSet.status.replicas;
};

const getStatus = replicaSet => {
  return isStatusOk(replicaSet) ? 'running' : 'error';
};

const getStatusType = replicaSet => {
  return isStatusOk(replicaSet) ? 'success' : 'error';
};

export const ReplicaSetsList = ({ DefaultRenderer, ...otherParams }) => {
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
      header: t('common.headers.status'),
      value: replicaSet => {
        const status = getStatus(replicaSet);
        const statusType = getStatusType(replicaSet);
        return <StatusBadge type={statusType}>{status}</StatusBadge>;
      },
    },
  ];

  const description = (
    <span>
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/"
        text="ReplicaSet"
      />
      {t('replica-sets.description')}
    </span>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
