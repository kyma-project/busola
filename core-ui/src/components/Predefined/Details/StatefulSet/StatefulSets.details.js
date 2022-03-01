import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy } from 'react-shared';

import { StatefulSetPods } from './StatefulSetPods';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { Selector } from 'shared/components/Selector/Selector';

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

  const MatchSelector = statefulset => (
    <Selector
      namespace={statefulset.metadata.namespace}
      labels={statefulset.spec?.selector?.matchLabels}
      selector={statefulset.spec?.selector}
      expressions={statefulset.spec?.selector?.matchExpressions}
    />
  );
  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[HPASubcomponent, MatchSelector]}
      {...otherParams}
    />
  );
}
