import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { ResourcePods } from '../ResourcePods';
import { StatefulSetPods } from './StatefulSetPods';
import { HPASubcomponent } from '../HPA/HPASubcomponent';

export function StatefulSetsDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: set => (
        <ControlledBy ownerReferences={set.metadata.ownerReferences} />
      ),
    },
    {
      header: t('common.headers.pods'),
      value: set => <StatefulSetPods key="replicas" set={set} />,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[ResourcePods, HPASubcomponent]}
      {...otherParams}
    />
  );
}
