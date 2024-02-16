import React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { useRestartAction } from 'shared/hooks/useRestartResource';

import { DeploymentCreate } from './DeploymentCreate';
import { DeploymentStatus } from './DeploymentStatus';
import { description } from './DeploymentDescription';

const getImages = deployment => {
  const images = deployment.spec.template.spec.containers?.map(
    container => container.image,
  );
  return images || [];
};

export function DeploymentList(props) {
  const { t } = useTranslation();
  const restartAction = useRestartAction(props.resourceUrl);

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: deployment => {
        return (
          <ControlledBy
            ownerReferences={deployment.metadata.ownerReferences}
            kindOnly
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

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      customListActions={[restartAction]}
      {...props}
      createResourceForm={DeploymentCreate}
      emptyListProps={{
        subtitleText: t('deployments.description'),
        url:
          'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',
      }}
    />
  );
}

export default DeploymentList;
