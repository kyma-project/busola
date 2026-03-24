import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';
import { getLastTransitionTime } from 'resources/helpers';

import { ControlledBy } from 'shared/components/ControlledBy/ControlledBy';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { EventsList } from 'shared/components/EventsList';

import { filterByResource } from 'hooks/useMessageList';

import { PodStatus } from './PodStatus';
import ContainersData from './ContainersData';
import PodCreate from './PodCreate';
import { useUrl } from 'hooks/useUrl';
import { ResourceDescription } from 'resources/Pods';
import { Link } from 'shared/components/Link/Link';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

interface PodDetailsProps {
  resourceName: string;
  resourceType: string;
  namespace: string;
  [key: string]: any;
}

export function PodDetails({
  resourceName,
  namespace,
  ...props
}: PodDetailsProps) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const Events = () => (
    <EventsList
      key="events"
      namespace={namespace}
      filter={filterByResource('Pod', resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const customColumns = [
    {
      header: t('common.headers.owner'),
      value: (pod: Record<string, any>) => (
        <ControlledBy
          ownerReferences={pod.metadata.ownerReferences}
          namespace={pod.metadata.namespace}
        />
      ),
    },
  ];

  const customStatusColumns = [
    {
      header: t('common.labels.last-transition'),
      value: (pod: Record<string, any>) =>
        getLastTransitionTime(pod?.status?.conditions),
    },
    {
      header: t('pods.status.host-ip'),
      value: (pod: Record<string, any>) =>
        pod.status?.hostIP ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pods.status.pod-ip'),
      value: (pod: Record<string, any>) =>
        pod.status?.podIP ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pods.status.pod-ips'),
      value: (pod: Record<string, any>) =>
        pod.status?.podIPs?.map((ip: any) => ip.ip).join(', ') ??
        EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pods.status.nominated-node-name'),
      value: (pod: Record<string, any>) =>
        pod.status?.nominatedNodeName ?? EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pods.status.qos-class'),
      value: (pod: Record<string, any>) =>
        pod.status?.qosClass ?? EMPTY_TEXT_PLACEHOLDER,
    },
  ];

  const statusConditions = (pod: Record<string, any>) => {
    return pod?.status?.conditions?.map((condition: Record<string, any>) => {
      return {
        header: { titleText: condition.type, status: condition.status },
        message:
          condition.message ?? condition.reason ?? EMPTY_TEXT_PLACEHOLDER,
      };
    });
  };

  const VolumesList = (resource: Record<string, any>) => {
    const headerRenderer = () => [
      t('pods.headers.volume-name'),
      t('pods.headers.type'),
      t('common.headers.name'),
    ];
    const rowRenderer = (volume: Record<string, any>) => {
      const volumeType = Object.keys(volume).find((key) => key !== 'name');
      return [
        volume.name,
        volumeType,
        <Link
          key={`${volume.name}-link`}
          url={namespaceUrl(
            `${pluralize(volumeType?.toLowerCase() || '')}/${
              volume[volumeType as string].name ||
              volume[volumeType as string].secretName ||
              volume[volumeType as string].claimName
            }`,
          )}
        >
          {volume[volumeType as string].name ||
            volume[volumeType as string].secretName ||
            volume[volumeType as string].claimName}
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

  const Containers = (resource: Record<string, any>) => (
    <ContainersData
      key="containers"
      type={t('pods.labels.containers')}
      containers={resource.spec.containers}
      statuses={resource.status.containerStatuses}
    />
  );
  const InitContainers = (resource: Record<string, any>) => (
    <ContainersData
      key="init-containers"
      type={t('pods.labels.init-containers')}
      containers={resource.spec.initContainers}
      statuses={resource.status.initContainerStatuses}
    />
  );

  return (
    <ResourceDetails
      customComponents={[VolumesList, Containers, InitContainers, Events]}
      customColumns={customColumns}
      description={ResourceDescription}
      createResourceForm={PodCreate}
      statusBadge={(pod) => <PodStatus pod={pod} />}
      statusConditions={statusConditions}
      customStatusColumns={customStatusColumns}
      resourceName={resourceName}
      namespace={namespace}
      {...props}
    />
  );
}

export default PodDetails;
