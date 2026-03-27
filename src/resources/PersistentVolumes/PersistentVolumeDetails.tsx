import { useTranslation } from 'react-i18next';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { useUrl } from 'hooks/useUrl';

import { PersistentVolumeStatus } from './PersistentVolumeStatus';
import PersistentVolumeCreate from './PersistentVolumeCreate';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import {
  PersistentVolumeMetadataType,
  PersistentVolumeSpecType,
  PersistentVolumeType,
  ResourceDescription,
} from 'resources/PersistentVolumes';
import { Link } from 'shared/components/Link/Link';
import { getReadableTimestampWithTime } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { VolumeNFS } from './components/VolumeNFS';
import { VolumeCSI } from './components/VolumeCSI';
import { VolumeFC } from './components/VolumeFC';
import { VolumeHostPath } from './components/VolumeHostPath';
import { VolumeISCSI } from './components/VolumeISCSI';
import { VolumeLocal } from './components/VolumeLocal';

interface PersistentVolumeDetailsProps {
  resourceName: string;
  resourceType: string;
  [key: string]: any;
}

export function PersistentVolumeDetails({
  resourceName,
  ...props
}: PersistentVolumeDetailsProps) {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();

  const { data: storageClasses } = useGetList()(
    '/apis/storage.k8s.io/v1/storageclasses',
  ) as { data: any[] | null };

  const { data: secrets } = useGetList()('/api/v1/secrets') as {
    data: any[] | null;
  };

  const { data: persistentVolumeClaims } = useGetList()(
    '/api/v1/persistentvolumeclaims',
  ) as { data: any[] | null };
  const findSecret = (secretName: string) =>
    secrets?.find(({ metadata }) => metadata.name === secretName);

  const PvDetails = ({
    spec,
    metadata,
  }: {
    spec: PersistentVolumeSpecType;
    metadata: PersistentVolumeMetadataType;
  }) => (
    <div key="persistent-volumes-ref" data-testid="persistent-volumes-ref">
      <UI5Panel
        title={t('common.headers.specification')}
        accessibleName={t('common.accessible-name.specification')}
      >
        <LayoutPanelRow
          name={t('pv.headers.finalizers')}
          value={<Tokens tokens={metadata.finalizers} />}
        />
        <LayoutPanelRow
          name={t('pv.headers.capacity')}
          value={spec.capacity?.storage}
        />
        <LayoutPanelRow
          name={t('pv.headers.mount-options')}
          value={<Tokens tokens={spec.mountOptions} />}
        />
        <LayoutPanelRow
          name={t('pv.headers.access-modes')}
          value={<Tokens tokens={spec.accessModes} />}
        />
        <LayoutPanelRow
          name={t('pv.headers.reclaim-policy')}
          value={spec.persistentVolumeReclaimPolicy}
        />
        <LayoutPanelRow
          name={t('pv.headers.storage-class-name')}
          value={
            storageClasses?.find(
              ({ metadata }) => metadata.name === spec?.storageClassName,
            ) ? (
              <Link
                url={resourceUrl({
                  kind: 'StorageClass',
                  metadata: {
                    name: spec?.storageClassName,
                  } as any,
                })}
              >
                {spec?.storageClassName}
              </Link>
            ) : (
              <p>{spec?.storageClassName || EMPTY_TEXT_PLACEHOLDER}</p>
            )
          }
        />
        <LayoutPanelRow
          name={t('pv.headers.claim-name')}
          value={
            persistentVolumeClaims?.find(
              ({ metadata }) => metadata.name === spec?.claimRef?.name,
            ) ? (
              <Link
                url={resourceUrl(
                  {
                    kind: 'PersistentVolumeClaim',
                    metadata: {
                      name: spec?.claimRef?.name,
                    } as any,
                  },
                  { namespace: spec?.claimRef?.namespace },
                )}
              >
                {spec?.claimRef?.name}
              </Link>
            ) : (
              <p>{spec?.claimRef?.name || EMPTY_TEXT_PLACEHOLDER}</p>
            )
          }
        />
        <LayoutPanelRow
          name={t('pv.headers.volumeMode')}
          value={spec?.volumeMode}
        />
      </UI5Panel>

      <UI5Panel
        title={t('pv.headers.volumeType')}
        accessibleName={`${t('pv.headers.volumeType')} panel`}
      >
        {spec.nfs && <VolumeNFS nfs={spec.nfs} />}
        {spec.csi && <VolumeCSI csi={spec.csi} />}
        {spec.fc && <VolumeFC fc={spec.fc} />}
        {spec.hostPath && <VolumeHostPath hostPath={spec.hostPath} />}
        {spec.iscsi && (
          <VolumeISCSI
            iscsi={spec.iscsi}
            secret={findSecret(spec.iscsi?.secretRef?.name)}
          />
        )}
        {spec.local && <VolumeLocal local={spec.local} />}
      </UI5Panel>
    </div>
  );

  const Events = () => (
    <EventsList
      key="events"
      filter={filterByResource('PersistentVolume', resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const customStatusColumns = [
    {
      header: t('pv.headers.lastPhaseTransitionTime'),
      value: (pv: PersistentVolumeType) =>
        getReadableTimestampWithTime(pv?.status?.lastPhaseTransitionTime),
    },
  ];

  return (
    <ResourceDetails
      statusBadge={(pv) => <PersistentVolumeStatus status={pv?.status} />}
      customStatusColumns={customStatusColumns}
      customComponents={[PvDetails, Events]}
      description={ResourceDescription}
      createResourceForm={PersistentVolumeCreate}
      resourceName={resourceName}
      {...props}
    />
  );
}

export default PersistentVolumeDetails;
