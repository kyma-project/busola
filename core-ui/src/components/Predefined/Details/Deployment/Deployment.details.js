import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy, ResourceDetails } from 'react-shared';
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

  const StatsComponent = deployment => {
    console.log('deployment', deployment);
    return (
      <StatsPanel
        type="pod"
        namespace={deployment.metadata.namespace}
        deployment={deployment.metadata.name}
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
