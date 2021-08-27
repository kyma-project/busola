import React from 'react';
import { StatusBadge } from 'react-shared';
import { CreateDeploymentForm } from 'shared/components/CreateDeploymentForm/CreateDeploymentForm';
import { useTranslation } from 'react-i18next';

const getImages = deployment => {
  const images =
    deployment.spec.template.spec.containers?.map(
      container => container.image,
    ) || [];
  return images;
};

const isStatusOk = deployment => {
  return deployment.status.readyReplicas === deployment.status.replicas;
};

const getStatus = deployment => {
  return isStatusOk(deployment) ? 'running' : 'error';
};

const getStatusType = deployment => {
  return isStatusOk(deployment) ? 'success' : 'error';
};

const getPodsCount = deployment => {
  return `${deployment.status.readyReplicas || 0} / ${
    deployment.status.replicas
  }`;
};

export const DeploymentsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('deployments.headers.images'),
      value: deployment => {
        const images = getImages(deployment);
        const imagesString = images.join(', ');
        return <span style={{ overflowWrap: 'anywhere' }}>{imagesString}</span>;
      },
    },
    {
      header: t('deployments.headers.pods'),
      value: deployment => {
        const podsCount = getPodsCount(deployment);
        const statusType = getStatusType(deployment);
        return <StatusBadge type={statusType}>{podsCount}</StatusBadge>;
      },
    },
    {
      header: t('common.headers.status'),
      value: deployment => {
        const status = getStatus(deployment);
        const statusType = getStatusType(deployment);
        return <StatusBadge type={statusType}>{status}</StatusBadge>;
      },
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      {...otherParams}
      listHeaderActions={
        <CreateDeploymentForm namespaceId={otherParams.namespace} />
      }
    />
  );
};
