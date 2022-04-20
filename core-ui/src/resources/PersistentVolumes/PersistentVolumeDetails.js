import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, LayoutPanel } from 'fundamental-react';

import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Tokens } from 'shared/components/Tokens';
import { StatsPanel } from 'shared/components/StatsGraph/StatsPanel';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { navigateToResource } from 'shared/helpers/universalLinks';

import { PersistentVolumeStatus } from './PersistentVolumeStatus';
import { PersistentVolumeCreate } from './PersistentVolumeCreate';

const StatsComponent = pv => {
  return <StatsPanel type="pod" mode="single" />;
};

export function PersistentVolumeDetails(props) {
  const { t } = useTranslation();

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
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('pv.details')} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
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
                  onClick={() =>
                    navigateToResource({
                      kind: 'StorageClass',
                      name: spec?.storageClassName,
                    })
                  }
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
                  onClick={() =>
                    navigateToResource({
                      name: spec?.claimRef?.name,
                      kind: 'PersistentVolumeClaim',
                      namespace: spec?.claimRef?.namespace,
                    })
                  }
                >
                  {spec?.claimRef?.name}
                </Link>
              ) : (
                <p>{spec?.claimRef?.name || EMPTY_TEXT_PLACEHOLDER}</p>
              )
            }
          />
        </LayoutPanel.Body>
      </LayoutPanel>

      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title={t('pv.nfs')} />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <LayoutPanelRow
            name={t('pv.headers.server')}
            value={spec.nfs?.server || EMPTY_TEXT_PLACEHOLDER}
          />
          <LayoutPanelRow
            name={t('pv.headers.path')}
            value={spec.nfs?.path || EMPTY_TEXT_PLACEHOLDER}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
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
      createResourceForm={PersistentVolumeCreate}
      {...props}
    />
  );
}

export default PersistentVolumeDetails;
