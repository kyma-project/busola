import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector.js';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';

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
    {
      header: t('common.headers.pods'),
      value: deployment => <DeploymentStatus deployment={deployment} />,
    },
  ];

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
      description={description}
      {...props}
    />
  );
}

export default DeploymentDetails;
