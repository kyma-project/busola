import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { DeploymentsCreate } from '../../Create/Deployments/Deployments.create';
import { DeploymentStatus } from './DeploymentStatus';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { Selector } from 'shared/components/Selector/Selector.js';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

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

  const StatsComponent = deployment => {
    const labelSelector = Object.entries(deployment.spec?.selector?.matchLabels)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    const resourceUrl = `/api/v1/namespaces/${deployment.metadata.namespace}/pods?labelSelector=${labelSelector}`;
    const { data } = useGetList()(resourceUrl);
    const connectedPods = (data || []).map(pod => pod.metadata.name);

    return (
      <StatsPanel
        type="pod"
        mode="multiple"
        pod={connectedPods}
        namespace={deployment.metadata.namespace}
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
