import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy, ResourceDetails, useGetList } from 'react-shared';
import { DeploymentsCreate } from '../../Create/Deployments/Deployments.create';
import { DeploymentStatus } from './DeploymentStatus';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { Selector } from 'shared/components/Selector/Selector.js';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';

const DeploymentsDetails = props => {
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
      namespace={deployment.metadata.namespace}
      labels={deployment.spec?.selector?.matchLabels}
      expressions={deployment?.spec.selector?.matchExpressions}
      selector={deployment.spec?.selector}
    />
  );

  const filterByPods = pods => prometheusResult => {
    return (
      pods.includes(prometheusResult?.metric?.pod) &&
      prometheusResult?.metric?.container != 'POD'
    );
  };

  const StatsComponent = deployment => {
    const labelSelector = Object.entries(deployment.spec?.selector?.matchLabels)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    const resourceUrl = `/api/v1/namespaces/${deployment.metadata.namespace}/pods?labelSelector=${labelSelector}`;
    const { data } = useGetList()(resourceUrl);
    const connectedPods = (data || []).map(pod => pod.metadata.name);

    return (
      <StatsPanel
        type="multipleMetrics"
        namespace={deployment.metadata.namespace}
        filter={filterByPods(connectedPods)}
      />
    );
  };
  return (
    <ResourceDetails
      customComponents={[HPASubcomponent, StatsComponent, MatchSelector]}
      customColumns={customColumns}
      createResourceForm={DeploymentsCreate}
      {...props}
    />
  );
};

export default DeploymentsDetails;
