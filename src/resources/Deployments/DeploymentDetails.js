import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector.js';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';

import { DeploymentStatus } from './DeploymentStatus';
import { DeploymentCreate } from './DeploymentCreate';
import { description } from './DeploymentDescription';

export function DeploymentDetails(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: deployment => (
        <ControlledBy ownerReferences={deployment.metadata.ownerReferences} />
      ),
    },
  ];

  const customStatusColumns = [
    {
      header: 'Last Scale Time' + ':',
      value: deployment => (
        <ReadableCreationTimestamp
          timestamp={deployment?.status?.conditions?.[1]?.lastUpdateTime}
        />
      ),
    },
    {
      header: 'Current Replicas' + ':',
      value: deployment => <div>{deployment?.status?.replicas}</div>,
    },
    {
      header: 'Updated Replicas' + ':',
      value: deployment => (
        <div>{deployment?.status?.updatedReplicas ?? 0}</div>
      ),
    },
    {
      header: t('deployments.status.available-replicas') + ':',
      value: deployment => (
        <div>{deployment?.status?.availableReplicas ?? 0}</div>
      ),
    },
    {
      header: 'Un' + t('deployments.status.available-replicas') + ':',
      value: deployment => (
        <div>{deployment?.status?.unavailableReplicas ?? 0}</div>
      ),
    },
  ];

  const statusConditions = deployment => {
    return deployment?.status?.conditions?.map(condition => {
      return {
        header: { titleText: condition.type, status: condition.status },
        message: condition.message,
      };
    });
  };

  const MatchSelector = deployment => (
    <Selector
      key="match-selector"
      namespace={deployment.metadata.namespace}
      labels={deployment.spec?.selector?.matchLabels}
      expressions={deployment?.spec.selector?.matchExpressions}
      selector={deployment.spec?.selector}
    />
  );

  const DeploymentPodTemplate = deployment => (
    <PodTemplate key="pod-template" template={deployment.spec.template} />
  );

  return (
    <ResourceDetails
      customComponents={[HPASubcomponent, MatchSelector, DeploymentPodTemplate]}
      customColumns={customColumns}
      createResourceForm={DeploymentCreate}
      statusBadge={deployment => <DeploymentStatus deployment={deployment} />}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      description={description}
      {...props}
    />
  );
}

export default DeploymentDetails;
