import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';

import { StatefulSetPods } from './StatefulSetPods';
import { StatefulSetCreate } from './StatefulSetCreate';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';

export function StatefulSetDetails(props) {
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

  const StatefulSetPodTemplate = statefulset => (
    <PodTemplate template={statefulset.spec.template} />
  );

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[
        HPASubcomponent,
        MatchSelector,
        StatefulSetPodTemplate,
      ]}
      createResourceForm={StatefulSetCreate}
      {...props}
    />
  );
}
export default StatefulSetDetails;
