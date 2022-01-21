import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as DescLink, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Link } from 'fundamental-react';
import { Trans } from 'react-i18next';
import { navigateToResource } from 'shared/helpers/universalLinks';
import { PersistentVolumeStatus } from '../Details/PersistentVolume/PersistentVolumeStatus';

export const PersistentVolumesList = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('pv.headers.storage-class'),
      value: pv =>
        (
          <Link
            onClick={() =>
              navigateToResource({
                name: pv.spec?.storageClassName,
                kind: 'StorageClass',
              })
            }
          >
            {pv.spec?.storageClassName}
          </Link>
        ) || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pv.headers.capacity'),
      value: pv => pv.spec?.capacity?.storage || EMPTY_TEXT_PLACEHOLDER,
    },
    {
      header: t('pv.headers.claim'),
      value: pv =>
        (
          <Link
            onClick={() =>
              navigateToResource({
                namespace: pv.spec?.claimRef?.namespace,
                name: pv.spec?.claimRef?.name,
                kind: pv.spec?.claimRef?.kind,
              })
            }
          >
            {pv.spec?.claimRef?.name}
          </Link>
        ) || EMPTY_TEXT_PLACEHOLDER,
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
    <DefaultRenderer
      resourceName={t('pv.title')}
      customColumns={customColumns}
      description={description}
      {...otherParams}
    />
  );
};
