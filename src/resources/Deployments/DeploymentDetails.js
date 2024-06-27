import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector.js';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';
import { DeploymentStatus } from './DeploymentStatus';
import DeploymentCreate from './DeploymentCreate';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

import { getLastTransitionTime } from 'resources/helpers';
import { ResourceDescription } from 'resources/Deployments';

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
      header: t('common.labels.last-transition'),
      value: deployment =>
        getLastTransitionTime(deployment?.status?.conditions),
    },
    {
      header: t('deployments.status.replicas'),
      value: deployment => <div>{deployment?.status?.replicas ?? 0}</div>,
    },
    {
      header: t('deployments.status.updated-replicas'),
      value: deployment => (
        <div>{deployment?.status?.updatedReplicas ?? 0}</div>
      ),
    },
    {
      header: t('deployments.status.available-replicas'),
      value: deployment => (
        <div>{deployment?.status?.availableReplicas ?? 0}</div>
      ),
    },
    {
      header: t('deployments.status.unavailable-replicas'),
      value: deployment => (
        <div>{deployment?.status?.unavailableReplicas ?? 0}</div>
      ),
    },
    {
      header: t('deployments.status.collision-count'),
      value: deployment => <div>{deployment?.status?.collisionCount ?? 0}</div>,
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

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('Deployment', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  return (
    <ResourceDetails
      customComponents={[
        HPASubcomponent,
        MatchSelector,
        DeploymentPodTemplate,
        Events,
      ]}
      customColumns={customColumns}
      createResourceForm={DeploymentCreate}
      statusBadge={deployment => <DeploymentStatus deployment={deployment} />}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      description={ResourceDescription}
      {...props}
    />
  );
}

export default DeploymentDetails;
