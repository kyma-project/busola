import React from 'react';
import { ControlledByKind, StatusBadge } from 'react-shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

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
  return `${deployment.status.readyReplicas || 0} / ${deployment.status
    .replicas || 0}`;
};

export const DeploymentsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t, i18n } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: deployment => {
        return (
          <ControlledByKind
            ownerReferences={deployment.metadata.ownerReferences}
          />
        );
      },
    },
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
        return (
          <StatusBadge
            i18n={i18n}
            resourceKind={otherParams.resourceType}
            type={statusType}
          >
            {status}
          </StatusBadge>
        );
      },
    },
  ];

  const description = (
    <Trans i18nKey="deployments.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
