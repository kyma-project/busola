import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { StatefulSetPods } from './StatefulSetPods';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { WorkloadSelector } from 'shared/components/WorkloadSelector/WorkloadSelector';

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

  const SelectorLabels = statefulset => {
    const { t } = useTranslation();
    return (
      <WorkloadSelector
        resource={statefulset}
        labels={statefulset.spec.selector?.matchLabels}
        title={t('selector.title')}
      />
    );
  };

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[HPASubcomponent, SelectorLabels]}
      {...otherParams}
    />
  );
}
