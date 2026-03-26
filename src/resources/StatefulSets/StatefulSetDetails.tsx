import { useTranslation } from 'react-i18next';
import {
  ControlledBy,
  OwnerReferences,
} from 'shared/components/ControlledBy/ControlledBy';
import {
  ResourceDetails,
  ResourceDetailsProps,
} from 'shared/components/ResourceDetails/ResourceDetails';
import { Selector } from 'shared/components/Selector/Selector';
import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';
import { StatefulSetPods } from './StatefulSetPods';
import StatefulSetCreate from './StatefulSetCreate';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { EventsList } from 'shared/components/EventsList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ResourceDescription } from 'resources/StatefulSets';
import { filterByResource } from '../../hooks/useMessageList';

export function StatefulSetDetails(
  props: {
    namespace: string;
    resourceName: string;
  } & Omit<
    ResourceDetailsProps,
    | 'customComponents'
    | 'customColumns'
    | 'customStatusColumns'
    | 'statusConditions'
    | 'statusBadge'
    | 'description'
    | 'createResourceForm'
  >,
) {
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
      value: (set: {
        metadata: { ownerReferences: OwnerReferences; namespace: string };
      }) => (
        <ControlledBy
          ownerReferences={set.metadata.ownerReferences}
          namespace={set.metadata.namespace}
        />
      ),
    },
  ];

  const MatchSelector = (statefulset: {
    metadata: { namespace: string };
    spec: {
      selector: {
        matchLabels: Record<string, string>;
        matchExpressions: any;
      };
    };
  }) => (
    <Selector
      key="match-selector"
      namespace={statefulset.metadata.namespace}
      labels={statefulset.spec?.selector?.matchLabels}
      selector={statefulset.spec?.selector}
      expressions={statefulset.spec?.selector?.matchExpressions}
    />
  );

  const StatefulSetPodTemplate = (statefulset: {
    spec: { template: Record<string, any> };
  }) => <PodTemplate key="pod-template" template={statefulset.spec.template} />;

  const customStatusColumns = [
    {
      header: t('stateful-sets.status.available-replicas'),
      value: (resource?: Record<string, any>) => (
        <div>{resource?.status?.availableReplicas ?? 0}</div>
      ),
    },
    {
      header: t('stateful-sets.status.collision-count'),
      value: (resource?: Record<string, any>) => (
        <div>{resource?.status?.collisionCount ?? 0} </div>
      ),
    },
    {
      header: t('stateful-sets.status.current-replicas'),
      value: (resource?: Record<string, any>) => (
        <div>{resource?.status?.currentReplicas ?? 0}</div>
      ),
    },
    {
      header: t('stateful-sets.status.current-revision'),
      value: (resource?: Record<string, any>) => (
        <div>
          {resource?.status?.currentRevision ?? EMPTY_TEXT_PLACEHOLDER}{' '}
        </div>
      ),
    },
    {
      header: t('stateful-sets.status.observed-generation'),
      value: (resource?: Record<string, any>) => (
        <div>
          {resource?.status?.observedGeneration ?? EMPTY_TEXT_PLACEHOLDER}{' '}
        </div>
      ),
    },
    {
      header: t('stateful-sets.status.ready-replicas'),
      value: (resource?: Record<string, any>) => (
        <div>{resource?.status?.readyReplicas ?? 0}</div>
      ),
    },
    {
      header: t('stateful-sets.status.replicas'),
      value: (resource?: Record<string, any>) => (
        <div>{resource?.status?.replicas ?? 0}</div>
      ),
    },
    {
      header: t('stateful-sets.status.updated-replicas'),
      value: (resource?: Record<string, any>) => (
        <div>{resource?.status?.updatedReplicas ?? 0}</div>
      ),
    },
    {
      header: t('stateful-sets.status.update-revision'),
      value: (resource?: Record<string, any>) => (
        <div>{resource?.status?.updateRevision ?? EMPTY_TEXT_PLACEHOLDER}</div>
      ),
    },
  ];

  const statusConditions = (resource?: Record<string, any>) => {
    return resource?.status?.conditions?.map(
      (condition: { type: string; status: string; message: string }) => {
        return {
          header: { titleText: condition.type, status: condition.status },
          message: condition.message,
        };
      },
    );
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
      statusBadge={(set) => <StatefulSetPods key="replicas" set={set} />}
      description={ResourceDescription}
      createResourceForm={StatefulSetCreate}
      {...props}
    />
  );
}

export default StatefulSetDetails;
