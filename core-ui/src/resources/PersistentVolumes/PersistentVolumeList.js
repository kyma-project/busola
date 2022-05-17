import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'fundamental-react';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ExternalLink as DescLink } from 'shared/components/Link/ExternalLink';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { navigateToResource } from 'shared/helpers/universalLinks';

import { PersistentVolumeStatus } from './PersistentVolumeStatus';
import { PersistentVolumeCreate } from './PersistentVolumeCreate';

export function PersistentVolumeList(props) {
  const { t } = useTranslation();
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
            onClick={() =>
              navigateToResource({
                kind: 'StorageClass',
                name: pv.spec?.storageClassName,
              })
            }
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
            onClick={() =>
              navigateToResource({
                name: pv.spec?.claimRef?.name,
                kind: 'PersistentVolumeClaim',
                namespace: pv.spec?.claimRef?.namespace,
              })
            }
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

  const description = (
    <Trans i18nKey="pv.description">
      <DescLink
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/storage/persistent-volumes"
      />
    </Trans>
  );

  return (
    <ResourcesList
      resourceName={t('pv.title')}
      customColumns={customColumns}
      description={description}
      createResourceForm={PersistentVolumeCreate}
      {...props}
    />
  );
}
export default PersistentVolumeList;
