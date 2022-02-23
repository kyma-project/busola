import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { DeploymentStatus } from './DeploymentStatus';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { Selector } from 'shared/components/Selector/Selector.js';

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

  const MatchSelector = deployment => {
    const { t } = useTranslation();
    return (
      <Selector
        resource={deployment}
        labels={deployment.spec.selector?.matchLabels}
        expressions={deployment.spec.selector?.matchExpressions}
        title={t('selector.title')}
      />
    );
  };

  return (
    <DefaultRenderer
      customComponents={[HPASubcomponent, MatchSelector]}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
