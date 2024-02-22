import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { useRestartAction } from 'shared/hooks/useRestartResource';

import { DeploymentCreate } from './DeploymentCreate';
import { DeploymentStatus } from './DeploymentStatus';
import {
  ResourceDescription,
  i18nDescriptionKey,
  docsURL,
} from 'resources/Deployments/index';

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
      description={ResourceDescription}
      customListActions={[restartAction]}
      {...props}
      createResourceForm={DeploymentCreate}
      emptyListProps={{
        subtitleText: i18nDescriptionKey,
        url: docsURL,
      }}
    />
  );
}

export default DeploymentList;
