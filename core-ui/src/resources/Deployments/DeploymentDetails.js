import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector.js';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';

import { DeploymentStatus } from './DeploymentStatus';
import { DeploymentCreate } from './DeploymentCreate';

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

  const StatsComponent = deployment => {
    const labelSelector = Object.entries(deployment.spec?.selector?.matchLabels)
      ?.map(([key, value]) => `${key}=${value}`)
      .join(',');
    const resourceUrl = `/api/v1/namespaces/${deployment.metadata.namespace}/pods?labelSelector=${labelSelector}`;
    const { data } = useGetList()(resourceUrl);
    const connectedPods = (data || []).map(pod => pod.metadata.name);

    return (
      <StatsPanel
        key="deployment-stats-panel"
        type="pod"
        mode="multiple"
        pod={connectedPods}
        namespace={deployment.metadata.namespace}
      />
    );
  };
  return (
    <ResourceDetails
      customComponents={[
        HPASubcomponent,
        StatsComponent,
        MatchSelector,
        DeploymentPodTemplate,
      ]}
      customColumns={customColumns}
      createResourceForm={DeploymentCreate}
      {...props}
    />
  );
}
export default DeploymentDetails;
