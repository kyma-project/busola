import React from 'react';
import { useTranslation } from 'react-i18next';
import { PersistentVolumeClaimStatus } from 'shared/components/PersistentVolumeClaimStatus';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { ResourcePods } from './ResourcePods';

export const PersistentVolumeClaimsDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('subscription.headers.conditions.status'),
      value: ({ status }) => (
        <PersistentVolumeClaimStatus phase={status.phase} />
      ),
    },
    {
      header: t('persistent-volume-claims.headers.storage-class'),
      value: ({ spec }) => (
        <p>{spec?.storageClassName || EMPTY_TEXT_PLACEHOLDER}</p>
      ),
    },
    {
      header: t('persistent-volume-claims.headers.capacity'), //capacity, storage or size
      value: ({ spec }) => <p>{spec.resources.requests.storage}</p>,
    },
  ];

  return (
    <DefaultRenderer
      customComponents={[ResourcePods]}
      customColumns={customColumns}
      singularName={t('persistent-volume-claims.name_singular')}
      {...otherParams}
    />
  );
};
