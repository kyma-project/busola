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
import { ResourceDescription } from 'resources/PersistentVolumes';
import { Link } from 'shared/components/Link/Link';
import { getReadableTimestampWithTime } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { Labels } from 'shared/components/Labels/Labels';

export function PersistentVolumeDetails(props) {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();

  const { data: storageClasses } = useGetList()(
    '/apis/storage.k8s.io/v1/storageclasses',
  );

  const { data: persistentVolumeClaims } = useGetList()(
    '/api/v1/persistentvolumeclaims',
  );

  const PvDetails = ({ spec, metadata, status }) => (
    <div key="persistent-volumes-ref" data-testid="persistent-volumes-ref">
      <UI5Panel title={t('pv.details')}>
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
                  },
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
                    },
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

      <UI5Panel title={t('pv.headers.source')}>
        {spec.nfs && (
          <>
            <LayoutPanelRow
              name={t('pv.headers.type')}
              value={t('pv.nfs.type')}
            />
            <LayoutPanelRow
              name={t('pv.nfs.server')}
              value={spec.nfs?.server || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('pv.nfs.path')}
              value={spec.nfs?.path || EMPTY_TEXT_PLACEHOLDER}
            />
          </>
        )}
        {spec.csi && (
          <>
            <LayoutPanelRow
              name={t('pv.headers.type')}
              value={t('pv.csi.type')}
            />
            <LayoutPanelRow
              name={t('pv.csi.driver')}
              value={spec.csi?.driver || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('pv.csi.volumeHandle')}
              value={spec.csi?.volumeHandle || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('pv.csi.fsType')}
              value={spec.csi?.fsType || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('pv.csi.volumeAttributes')}
              value={
                (
                  <Labels
                    labels={spec.csi?.volumeAttributes || {}}
                    shortenLongLabels={false}
                  />
                ) || EMPTY_TEXT_PLACEHOLDER
              }
            />
          </>
        )}
        {spec.fc && (
          <>
            <LayoutPanelRow
              name={t('pv.headers.type')}
              value={t('pv.fc.type')}
            />
            <LayoutPanelRow
              name={t('pv.fc.lun')}
              value={spec.fc?.lun || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('pv.fc.fsType')}
              value={spec.fc?.fsType || EMPTY_TEXT_PLACEHOLDER}
            />
            {spec.fc?.wwids && (
              <LayoutPanelRow
                name={t('pv.fc.wwids')}
                value={
                  <Tokens tokens={spec.fc?.wwids || []} /> ||
                  EMPTY_TEXT_PLACEHOLDER
                }
              />
            )}
            {spec.fc?.targetWWNs && (
              <LayoutPanelRow
                name={t('pv.fc.targetWWNs')}
                value={
                  <Tokens tokens={spec.fc?.targetWWNs || []} /> ||
                  EMPTY_TEXT_PLACEHOLDER
                }
              />
            )}
          </>
        )}
      </UI5Panel>
    </div>
  );

  const Events = () => (
    <EventsList
      filter={filterByResource('PersistentVolume', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const customStatusColumns = [
    {
      header: t('pv.headers.lastPhaseTransitionTime'),
      value: pv =>
        getReadableTimestampWithTime(pv?.status?.lastPhaseTransitionTime),
    },
  ];

  return (
    <ResourceDetails
      statusBadge={pv => <PersistentVolumeStatus status={pv?.status} />}
      customStatusColumns={customStatusColumns}
      customComponents={[PvDetails, Events]}
      description={ResourceDescription}
      createResourceForm={PersistentVolumeCreate}
      {...props}
    />
  );
}

export default PersistentVolumeDetails;
