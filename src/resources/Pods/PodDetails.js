import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import pluralize from 'pluralize';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

import { PodStatus } from './PodStatus';
import ContainersData from './ContainersData';
import { PodCreate } from './PodCreate';
import { PodStatsGraph } from './PodStatsGraph';
import { useUrl } from 'hooks/useUrl';

export function PodDetails(props) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const Events = () => (
    <EventsList
      namespace={props.namespace}
      filter={filterByResource('Pod', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const customColumns = [
    {
      header: t('pods.headers.pod-ip'),
      value: pod => pod.status.podIP,
    },
    {
      header: t('common.headers.status'),
      value: pod => <PodStatus pod={pod} />,
    },
    {
      header: t('common.headers.owner'),
      value: pod => (
        <ControlledBy ownerReferences={pod.metadata.ownerReferences} />
      ),
    },
  ];

  const VolumesList = resource => {
    const headerRenderer = _ => [
      t('pods.headers.volume-name'),
      t('pods.headers.type'),
      t('common.headers.name'),
    ];
    const rowRenderer = volume => {
      const volumeType = Object.keys(volume).find(key => key !== 'name');
      return [
        volume.name,
        volumeType,
        <Link
          className="fd-link"
          to={namespaceUrl(
            `${pluralize(volumeType.toLowerCase() || '')}/${volume[volumeType]
              .name ||
              volume[volumeType].secretName ||
              volume[volumeType].claimName}`,
          )}
        >
          {volume[volumeType].name ||
            volume[volumeType].secretName ||
            volume[volumeType].claimName}
        </Link>,
      ];
    };

    return (
      <GenericList
        key="volumes"
        title={t('pods.labels.volumes')}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        entries={resource.spec.volumes}
      />
    );
  };

  const Containers = resource => (
    <ContainersData
      key="containers"
      type={t('pods.labels.containers')}
      containers={resource.spec.containers}
      statuses={resource.status.containerStatuses}
    />
  );
  const InitContainers = resource => (
    <ContainersData
      key="init-containers"
      type={t('pods.labels.init-containers')}
      containers={resource.spec.initContainers}
      statuses={resource.status.initContainerStatuses}
    />
  );

  return (
    <ResourceDetails
      customComponents={[
        PodStatsGraph,
        VolumesList,
        Containers,
        InitContainers,
        Events,
      ]}
      customColumns={customColumns}
      createResourceForm={PodCreate}
      {...props}
    />
  );
}
export default PodDetails;
