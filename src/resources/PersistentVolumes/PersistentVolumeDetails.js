import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { useUrl } from 'hooks/useUrl';

import { PersistentVolumeStatus } from './PersistentVolumeStatus';
import { PersistentVolumeCreate } from './PersistentVolumeCreate';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { ResourceDescription } from 'resources/PersistentVolumes';

export function PersistentVolumeDetails(props) {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();

  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) => <PersistentVolumeStatus status={status} />,
    },
  ];

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
                className="bsl-link"
                to={resourceUrl({
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
                className="bsl-link"
                to={resourceUrl(
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
      </UI5Panel>

      <UI5Panel title={t('pv.nfs')}>
        <LayoutPanelRow
          name={t('pv.headers.server')}
          value={spec.nfs?.server || EMPTY_TEXT_PLACEHOLDER}
        />
        <LayoutPanelRow
          name={t('pv.headers.path')}
          value={spec.nfs?.path || EMPTY_TEXT_PLACEHOLDER}
        />
      </UI5Panel>
    </div>
  );

  const Events = () => (
    <EventsList
      filter={filterByResource('PersistentVolume', props.resourceName)}
      hideInvolvedObjects={true}
    />
  );

  return (
    <ResourceDetails
      customColumns={customColumns}
      customComponents={[PvDetails, Events]}
      description={ResourceDescription}
      createResourceForm={PersistentVolumeCreate}
      {...props}
    />
  );
}

export default PersistentVolumeDetails;
