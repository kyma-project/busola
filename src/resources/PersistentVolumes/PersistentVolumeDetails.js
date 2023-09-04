import React from 'react';
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
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';

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
      <Panel
        fixed
        className="fd-margin--md"
        header={
          <Toolbar>
            <Title level="H5">{t('pv.details')}</Title>
          </Toolbar>
        }
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
                className="fd-link"
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
                className="fd-link"
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
      </Panel>

      <Panel
        fixed
        className="fd-margin--md"
        header={
          <Toolbar>
            <Title level="H5">{t('pv.nfs')}</Title>
          </Toolbar>
        }
      >
        <LayoutPanelRow
          name={t('pv.headers.server')}
          value={spec.nfs?.server || EMPTY_TEXT_PLACEHOLDER}
        />
        <LayoutPanelRow
          name={t('pv.headers.path')}
          value={spec.nfs?.path || EMPTY_TEXT_PLACEHOLDER}
        />
      </Panel>
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
