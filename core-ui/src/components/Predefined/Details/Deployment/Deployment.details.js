import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { ResourcePods } from '../ResourcePods.js';
import { DeploymentStatus } from './DeploymentStatus';
import { HPASubcomponent } from '../HPA/HPASubcomponent';

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

  return (
    <DefaultRenderer
      customComponents={[ResourcePods, HPASubcomponent]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
