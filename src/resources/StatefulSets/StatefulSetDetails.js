import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';
import { StatefulSetPods } from './StatefulSetPods';
import StatefulSetCreate from './StatefulSetCreate';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { EventsList } from 'shared/components/EventsList';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ResourceDescription } from 'resources/StatefulSets';

import { filterByResource } from '../../hooks/useMessageList';
export function StatefulSetDetails(props) {
  const { t } = useTranslation();

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('StatefulSet', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: set => (
        <ControlledBy ownerReferences={set.metadata.ownerReferences} />
      ),
    },
  ];

  const MatchSelector = statefulset => (
    <Selector
      key="match-selector"
      namespace={statefulset.metadata.namespace}
      labels={statefulset.spec?.selector?.matchLabels}
      selector={statefulset.spec?.selector}
      expressions={statefulset.spec?.selector?.matchExpressions}
    />
  );

  const StatefulSetPodTemplate = statefulset => (
    <PodTemplate key="pod-template" template={statefulset.spec.template} />
  );

  const customStatusColumns = [
    {
      header: t('stateful-sets.status.available-replicas'),
      value: resource => <div>{resource?.status?.availableReplicas ?? 0}</div>,
    },
    {
      header: t('stateful-sets.status.collision-count'),
      value: resource => <div>{resource?.status?.collisionCount ?? 0} </div>,
    },
    {
      header: t('stateful-sets.status.current-replicas'),
      value: resource => <div>{resource?.status?.currentReplicas ?? 0}</div>,
    },
    {
      header: t('stateful-sets.status.current-revision'),
      value: resource => (
        <div>
          {resource?.status?.currentRevision ?? EMPTY_TEXT_PLACEHOLDER}{' '}
        </div>
      ),
    },
    {
      header: t('stateful-sets.status.observed-generation'),
      value: resource => (
        <div>
          {resource?.status?.observedGeneration ?? EMPTY_TEXT_PLACEHOLDER}{' '}
        </div>
      ),
    },
    {
      header: t('stateful-sets.status.ready-replicas'),
      value: resource => <div>{resource?.status?.readyReplicas ?? 0}</div>,
    },
    {
      header: t('stateful-sets.status.replicas'),
      value: resource => <div>{resource?.status?.replicas ?? 0}</div>,
    },
    {
      header: t('stateful-sets.status.updated-replicas'),
      value: resource => <div>{resource?.status?.updatedReplicas ?? 0}</div>,
    },
    {
      header: t('stateful-sets.status.update-revision'),
      value: resource => (
        <div>{resource?.status?.updateRevision ?? EMPTY_TEXT_PLACEHOLDER}</div>
      ),
    },
  ];

  const statusConditions = resource => {
    return resource?.status?.conditions?.map(condition => {
      return {
        header: { titleText: condition.type, status: condition.status },
        message: condition.message,
      };
    });
  };

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[
        HPASubcomponent,
        MatchSelector,
        StatefulSetPodTemplate,
        Events,
      ]}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      statusBadge={set => <StatefulSetPods key="replicas" set={set} />}
      description={ResourceDescription}
      createResourceForm={StatefulSetCreate}
      {...props}
    />
  );
}

export default StatefulSetDetails;
