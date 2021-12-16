import React from 'react';
import { ControlledByKind, Link } from 'react-shared';
import { useTranslation, Trans } from 'react-i18next';
import { DeploymentStatus } from '../Details/Deployment/DeploymentStatus';

const getImages = deployment => {
  const images =
    deployment.spec.template.spec.containers?.map(
      container => container.image,
    ) || [];
  return images;
};

export const DeploymentsList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

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
      header: t('common.headers.pods'),
      value: deployment => <DeploymentStatus deployment={deployment} />,
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
