import React from 'react';
import { Link, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Trans, useTranslation } from 'react-i18next';
import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';

export const PersistentVolumeClaimsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
      value: ({ status }) => ({
        content: <PersistentVolumeClaimStatus phase={status.phase} />,
        style: { wordBreak: 'keep-all' },
      }),
    },
    {
      header: t('persistent-volume-claims.headers.storage-class'),
      value: ({ spec }) => ({
        content: spec?.storageClassName || EMPTY_TEXT_PLACEHOLDER,
        style: { wordBreak: 'keep-all' },
      }),
    },
    {
      header: t('persistent-volume-claims.headers.capacity'), //capacity, storage or size
      value: ({ spec }) => ({
        content: spec.resources.requests.storage,
        style: { wordBreak: 'keep-all' },
      }),
    },
  ];

  const description = (
    <Trans i18nKey="persistent-volume-claims.description">
      <Link
        className="fd-link"
        url="https://kubernetes.io/docs/concepts/storage/persistent-volumes/"
      />
    </Trans>
  );

  return (
    <DefaultRenderer
      description={description}
      customColumns={customColumns}
      {...otherParams}
    />
  );
};
