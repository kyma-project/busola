import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector.js';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';
import { DeploymentStatus } from './DeploymentStatus';
import DeploymentCreate from './DeploymentCreate';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
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
      header: t('deployments.status.current-replicas'),
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
        <div>
          {deployment?.status?.availableReplicas ?? EMPTY_TEXT_PLACEHOLDER}
        </div>
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
      description={ResourceDescription}
      {...props}
    />
  );
}

export default DeploymentDetails;
