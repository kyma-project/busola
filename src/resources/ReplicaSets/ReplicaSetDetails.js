import React from 'react';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useTranslation } from 'react-i18next';

import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';
import { ReplicaSetStatus } from './ReplicaSetStatus';
import { Selector } from 'shared/components/Selector/Selector';
import ReplicaSetCreate from './ReplicaSetCreate';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { ResourceDescription } from 'resources/ReplicaSets';
import { EventsList } from '../../shared/components/EventsList';
import { filterByResource } from '../../hooks/useMessageList';
import { CountingCard } from '../../shared/components/CountingCard/CountingCard';

export function ReplicaSetsDetails(props) {
  const { t } = useTranslation();

  const Events = () => (
    <EventsList
      key="events"
      namespace={props.namespace}
      filter={filterByResource('ReplicaSet', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: resource => (
        <ControlledBy ownerReferences={resource.metadata.ownerReferences} />
      ),
    },
    {
      header: t('replica-sets.headers.limits'),
      value: resource => {
        const containers = resource.spec.template.spec.containers || [];
        return (
          <React.Fragment key="limits">
            {containers.map(c => (
              <React.Fragment key={c.name}>
                {t('replica-sets.cpu')}: {c.resources?.limits?.cpu}
                <br />
                {t('replica-sets.memory')}: {c.resources?.limits?.memory}
                <br />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      },
    },
    {
      header: t('replica-sets.headers.requests'),
      value: resource => {
        const containers = resource.spec.template.spec.containers || [];
        return (
          <React.Fragment key="requests">
            {containers.map(c => (
              <React.Fragment key={c.name}>
                {t('replica-sets.cpu')}: {c.resources?.requests?.cpu}
                <br />
                {t('replica-sets.memory')}: {c.resources?.requests?.memory}
                <br />
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      },
    },
  ];

  const customStatusColumns = [
    {
      header: t('replica-sets.status.observedGeneration'),
      value: resource => (
        <div>{resource?.status?.observedGeneration ?? 0} </div>
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

  const MatchSelector = replicaset => (
    <Selector
      key="match-selector"
      namespace={replicaset.metadata.namespace}
      labels={replicaset.spec?.selector?.matchLabels}
      expressions={replicaset.spec?.selector?.matchExpressions}
      selector={replicaset.spec?.selector}
    />
  );

  const ReplicaSetPodTemplate = replicaset => (
    <PodTemplate key="pod-template" template={replicaset.spec.template} />
  );

  const customOverview = resource => {
    return (
      <CountingCard
        value={resource?.status?.replicas ?? 0}
        title={t('replica-sets.overview.header')}
        subTitle={t('replica-sets.overview.replicas')}
        extraInfo={[
          {
            title: t('replica-sets.overview.readyReplicas'),
            value: resource?.status?.readyReplicas ?? 0,
          },
          {
            title: t('replica-sets.overview.availableReplicas'),
            value: resource?.status?.availableReplicas ?? 0,
          },
          {
            title: t('replica-sets.overview.fullyLabeledReplicas'),
            value: resource?.status?.fullyLabeledReplicas ?? 0,
          },
        ]}
      />
    );
  };

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[
        HPASubcomponent,
        MatchSelector,
        ReplicaSetPodTemplate,
        Events,
      ]}
      statusBadge={replicaSet => <ReplicaSetStatus replicaSet={replicaSet} />}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      description={ResourceDescription}
      createResourceForm={ReplicaSetCreate}
      customOverview={customOverview}
      {...props}
    />
  );
}

export default ReplicaSetsDetails;
