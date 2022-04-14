import React from 'react';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledByKind } from 'shared/components/ControlledBy/ControlledBy';
import { Link } from 'shared/components/Link/Link';
import { useTranslation, Trans } from 'react-i18next';
import { DeploymentStatus } from '../Details/Deployment/DeploymentStatus';
import { useRestartAction } from 'shared/hooks/useRestartResource';
import { DeploymentsCreate } from '../Create/Deployments/Deployments.create';

const getImages = deployment => {
  const images =
    deployment.spec.template.spec.containers?.map(
      container => container.image,
    ) || [];
  return images;
};

const DeploymentsList = props => {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

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
    <ResourcesList
      customColumns={customColumns}
      description={description}
      customListActions={[restartAction]}
      createResourceForm={DeploymentsCreate}
      {...props}
    />
  );
};
export default DeploymentsList;
