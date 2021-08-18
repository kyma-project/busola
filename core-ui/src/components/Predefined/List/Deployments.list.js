import React from 'react';
import { StatusBadge } from 'react-shared';
import { CreateDeploymentForm } from '../../../shared/components/CreateDeploymentForm/CreateDeploymentForm';

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
  const customColumns = [
    {
      header: 'Images',
      value: deployment => {
        const images = getImages(deployment);
        const imagesString = images.join(', ');
        return <span style={{ overflowWrap: 'anywhere' }}>{imagesString}</span>;
      },
    },
    {
      header: 'Pods',
      value: deployment => {
        const podsCount = getPodsCount(deployment);
        const statusType = getStatusType(deployment);
        return <StatusBadge type={statusType}>{podsCount}</StatusBadge>;
      },
    },
    {
      header: 'Status',
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
