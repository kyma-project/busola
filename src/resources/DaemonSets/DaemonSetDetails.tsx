import { useTranslation } from 'react-i18next';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Selector } from 'shared/components/Selector/Selector';
import { DaemonSetStatus } from './DaemonSetStatus';
import DaemonSetCreate from './DaemonSetCreate';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { ResourceDescription } from 'resources/DaemonSets';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from '../../hooks/useMessageList';

const Tolerations = (resource: Record<string, any>) => {
  const { t } = useTranslation();

  const headerRenderer = () => [
    t('daemon-sets.tolerations.key'),
    t('daemon-sets.tolerations.operator'),
    t('daemon-sets.tolerations.effect'),
    t('daemon-sets.tolerations.toleration-seconds'),
  ];

  const rowRenderer = (entry: Record<string, any>) => [
    entry.key || EMPTY_TEXT_PLACEHOLDER,
    entry.operator || EMPTY_TEXT_PLACEHOLDER,
    entry.effect || EMPTY_TEXT_PLACEHOLDER,
    entry.tolerationSeconds || EMPTY_TEXT_PLACEHOLDER,
  ];
  const textSearchProperties = [
    'key',
    'operator',
    'effect',
    'toleration-seconds',
  ];
  return (
    <GenericList
      key="tolerations"
      title={t('daemon-sets.tolerations.title')}
      entries={resource.spec.template.spec.tolerations || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      testid="daemon-set-tolerations"
      searchSettings={{
        textSearchProperties,
      }}
    />
  );
};
interface DaemonSetDetailsProps {
  namespace: string;
  resourceName: string;
  resourceUrl?: string;
  resourceType: string;
}
export function DaemonSetDetails(props: DaemonSetDetailsProps) {
  const { t } = useTranslation();

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('DaemonSet', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: (resource: Record<string, any>) => (
        <ControlledBy
          ownerReferences={resource.metadata.ownerReferences}
          namespace={resource.metadata.namespace}
        />
      ),
    },
  ];

  const customStatusColumns = [
    {
      header: t('daemon-sets.status.collision-count'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.collisionCount ?? 0} </div>
      ),
    },
    {
      header: t('daemon-sets.status.current-number-scheduled'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.currentNumberScheduled ?? 0} </div>
      ),
    },
    {
      header: t('daemon-sets.status.desired-number-scheduled'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.desiredNumberScheduled ?? 0} </div>
      ),
    },
    {
      header: t('daemon-sets.status.number-available'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.numberAvailable ?? 0} </div>
      ),
    },
    {
      header: t('daemon-sets.status.number-misscheduled'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.numberMisscheduled ?? 0} </div>
      ),
    },
    {
      header: t('daemon-sets.status.number-ready'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.numberReady ?? 0} </div>
      ),
    },
    {
      header: t('daemon-sets.status.number-unavailable'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.numberUnavailable ?? 0} </div>
      ),
    },
    {
      header: t('daemon-sets.status.updated-number-scheduled'),
      value: (resource: Record<string, any>) => (
        <div>{resource?.status?.updatedNumberScheduled ?? 0} </div>
      ),
    },
  ];

  const statusConditions = (resource: Record<string, any>) => {
    return resource?.status?.conditions?.map(
      (condition: Record<string, any>) => {
        return {
          header: { titleText: condition.type, status: condition.status },
          message: condition.message,
        };
      },
    );
  };

  const MatchSelector = (daemonSet: Record<string, any>) => (
    <Selector
      key="match-selector"
      namespace={daemonSet.metadata.namespace}
      labels={daemonSet.spec?.selector?.matchLabels}
      expressions={daemonSet.spec?.selector?.matchExpressions}
      selector={daemonSet.spec?.selector}
    />
  );

  const DaemonSetPodTemplate = (daemonSet: Record<string, any>) => (
    <PodTemplate key="pod-template" template={daemonSet.spec.template} />
  );

  return (
    <ResourceDetails
      customComponents={[
        Tolerations,
        MatchSelector,
        DaemonSetPodTemplate,
        Events,
      ]}
      customColumns={customColumns}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      statusBadge={(resource) => <DaemonSetStatus daemonSet={resource} />}
      createResourceForm={DaemonSetCreate}
      description={ResourceDescription}
      {...props}
    />
  );
}

export default DaemonSetDetails;
