import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { DeploymentStatus } from './DeploymentStatus';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { WorkloadSelector } from 'shared/components/WorkloadSelector/WorkloadSelector.js';

export const DeploymentsDetails = ({ DefaultRenderer, ...otherParams }) => {
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

  const WorkloadSelectorLabels = deployment => {
    const { t } = useTranslation();
    return (
      <WorkloadSelector
        resource={deployment}
        labels={deployment.spec.selector?.matchLabels}
        title={t('selector.title')}
      />
    );
  };

  return (
    <DefaultRenderer
      customComponents={[WorkloadSelectorLabels, HPASubcomponent]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
