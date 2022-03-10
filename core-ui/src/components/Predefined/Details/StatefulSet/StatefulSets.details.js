import React from 'react';
import { useTranslation } from 'react-i18next';
import { ControlledBy, ResourceDetails } from 'react-shared';

import { StatefulSetPods } from './StatefulSetPods';
import { HPASubcomponent } from '../HPA/HPASubcomponent';
import { Selector } from 'shared/components/Selector/Selector';
import { StatefulSetsCreate } from '../../Create/StatefulSets/StatefulSets.create';

function StatefulSetsDetails(props) {
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
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[HPASubcomponent, MatchSelector]}
      createResourceForm={StatefulSetsCreate}
      {...props}
    />
  );
}
export default StatefulSetsDetails;
