import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';

import { PersistentVolumeStatus } from './PersistentVolumeStatus';
import { PersistentVolumeCreate } from './PersistentVolumeCreate';
import { useUrl } from 'hooks/useUrl';
import { description } from './PersistentVolumeDescription';

export function PersistentVolumeList(props) {
  const { t } = useTranslation();
  const { resourceUrl } = useUrl();

  const { data: storageClasses } = useGetList()(
    '/apis/storage.k8s.io/v1/storageclasses',
  );

  const { data: persistentVolumeClaims } = useGetList()(
    '/api/v1/persistentvolumeclaims',
  );

  const customColumns = [
    {
      header: t('pv.headers.storage-class'),
      value: pv =>
        storageClasses?.find(
          ({ metadata }) => metadata.name === pv.spec?.storageClassName,
        ) ? (
          <Link
            className="bsl-link"
            to={resourceUrl({
              kind: 'StorageClass',
              metadata: {
                name: pv.spec?.storageClassName,
              },
            })}
          >
            {pv.spec?.storageClassName}
          </Link>
        ) : (
          <p>{pv.spec?.storageClassName || EMPTY_TEXT_PLACEHOLDER}</p>
        ),
    },
    {
      header: t('pv.headers.capacity'),
      value: pv => pv.spec?.capacity?.storage || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pv.headers.claim'),
      value: pv =>
        persistentVolumeClaims?.find(
          ({ metadata }) => metadata.name === pv.spec?.claimRef?.name,
        ) ? (
          <Link
            className="bsl-link"
            to={resourceUrl(
              {
                kind: 'PersistentVolumeClaim',
                metadata: {
                  name: pv.spec?.claimRef?.name,
                },
              },
              { namespace: pv.spec?.claimRef?.namespace },
            )}
          >
            {pv.spec?.claimRef?.name}
          </Link>
        ) : (
          <p>{pv.spec?.claimRef?.name || EMPTY_TEXT_PLACEHOLDER}</p>
        ),
    },
    {
      header: t('common.headers.status'),
      value: pv => (
        <span style={{ wordBreak: 'keep-all' }}>
          <PersistentVolumeStatus status={pv.status} />
        </span>
      ),
    },
  ];

  return (
    <ResourcesList
      disableMargin={props.disableMargin}
      resourceTitle={t('pv.title')}
      customColumns={customColumns}
      description={description}
      {...props}
      createResourceForm={PersistentVolumeCreate}
      emptyListProps={{
        subtitleText: t('pv.description'),
        url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes',
      }}
    />
  );
}
export default PersistentVolumeList;
