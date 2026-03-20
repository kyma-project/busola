import { Fragment } from 'react';
import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { useTranslation } from 'react-i18next';

import { HPASubcomponent } from 'resources/HorizontalPodAutoscalers/HPASubcomponent';
import { ReplicaSetStatus } from './ReplicaSetStatus';
import { Selector } from 'shared/components/Selector/Selector';
import ReplicaSetCreate from './ReplicaSetCreate';
import { PodTemplate } from 'shared/components/PodTemplate/PodTemplate';
import { ResourceDescription } from 'resources/ReplicaSets';
import { EventsList } from 'shared/components/EventsList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { filterByResource } from 'hooks/useMessageList';

interface ReplicaSetsDetailsProps {
  namespace: string;
  resourceName: string;
  [key: string]: any;
}

export function ReplicaSetsDetails(props: ReplicaSetsDetailsProps) {
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
      value: (resource: any) => (
        <ControlledBy
          ownerReferences={resource.metadata.ownerReferences}
          namespace={resource.metadata.namespace}
        />
      ),
    },
  ];

  const Specification = ({ spec }: any) => {
    const containers = spec.template.spec.containers || [];
    if (
      !containers?.[0].resources?.limits &&
      !containers?.[0].resources?.requests
    ) {
      return null;
    }

    return (
      <UI5Panel
        key="specification"
        title={t('common.headers.specification')}
        accessibleName={t('common.accessible-name.specification')}
        keyComponent="specification-panel"
      >
        {containers?.[0].resources?.limits && (
          <LayoutPanelRow
            name={t('replica-sets.headers.limits')}
            value={
              <Fragment key="limits">
                {containers.map((c: any) => (
                  <Fragment key={c.name}>
                    {t('replica-sets.cpu')}: {c.resources?.limits?.cpu}
                    <br />
                    {t('replica-sets.memory')}: {c.resources?.limits?.memory}
                    <br />
                  </Fragment>
                ))}
              </Fragment>
            }
          />
        )}
        {containers?.[0].resources?.requests && (
          <LayoutPanelRow
            name={t('replica-sets.headers.requests')}
            value={
              <Fragment key="requests">
                {containers.map((c: any) => (
                  <Fragment key={c.name}>
                    {t('replica-sets.cpu')}: {c.resources?.requests?.cpu}
                    <br />
                    {t('replica-sets.memory')}: {c.resources?.requests?.memory}
                    <br />
                  </Fragment>
                ))}
              </Fragment>
            }
          />
        )}
      </UI5Panel>
    );
  };

  const customStatusColumns = [
    {
      header: t('replica-sets.status.available-replicas'),
      value: (resource: any) => (
        <div>{resource?.status?.availableReplicas ?? 0}</div>
      ),
    },
    {
      header: t('replica-sets.status.fully-labeled-replicas'),
      value: (resource: any) => (
        <div>{resource?.status?.fullyLabeledReplicas ?? 0}</div>
      ),
    },
    {
      header: t('replica-sets.status.observed-generation'),
      value: (resource: any) => (
        <div>
          {resource?.status?.observedGeneration ?? EMPTY_TEXT_PLACEHOLDER}{' '}
        </div>
      ),
    },
    {
      header: t('replica-sets.status.ready-replicas'),
      value: (resource: any) => (
        <div>{resource?.status?.readyReplicas ?? 0}</div>
      ),
    },
    {
      header: t('replica-sets.status.replicas'),
      value: (resource: any) => <div>{resource?.status?.replicas ?? 0}</div>,
    },
  ];
  const statusConditions = (resource: any) => {
    return resource?.status?.conditions?.map((condition: any) => {
      const overridenStatus = () => {
        if (condition.type === 'ReplicaFailure')
          return condition.status === 'True' ? 'Negative' : 'Positive';
        return undefined;
      };
      return {
        header: {
          titleText: condition.type,
          status: condition.status,
          overrideStatusType: overridenStatus(),
        },
        message: condition.message,
      };
    });
  };

  const MatchSelector = (replicaset: any) => (
    <Selector
      key="match-selector"
      namespace={replicaset.metadata.namespace}
      labels={replicaset.spec?.selector?.matchLabels}
      expressions={replicaset.spec?.selector?.matchExpressions}
      selector={replicaset.spec?.selector}
    />
  );

  const ReplicaSetPodTemplate = (replicaset: any) => (
    <PodTemplate key="pod-template" template={replicaset.spec.template} />
  );

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[
        Specification,
        HPASubcomponent,
        MatchSelector,
        ReplicaSetPodTemplate,
        Events,
      ]}
      statusBadge={(replicaSet: any) => (
        <ReplicaSetStatus replicaSet={replicaSet} />
      )}
      customStatusColumns={customStatusColumns}
      statusConditions={statusConditions}
      description={ResourceDescription}
      createResourceForm={ReplicaSetCreate}
      {...(props as any)}
    />
  );
}

export default ReplicaSetsDetails;
