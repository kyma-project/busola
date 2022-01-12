import React from 'react';
import { Link, EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { Trans, useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

const createPhaseProperties = (phase, t) => {
  switch (phase) {
    case 'Bound':
      return {
        type: 'success',
      };
    case 'Lost':
      return {
        type: 'warning',
        tooltipContent: t('persistent-volume-claim.tooltips.lost'),
      };
    case 'Pending':
      return {
        type: 'info',
        tooltipContent: t('persistent-volume-claim.tooltips.pending'),
      };
    default: {
    }
  }
};

const PersistentVolumeClaimStatus = ({ phase }) => {
  const { t, i18n } = useTranslation();
  const phaseProperties = createPhaseProperties(phase, t);

  return (
    <StatusBadge
      resourceKind="persistentvolumeclaim"
      type={phaseProperties.type}
      tooltipContent={phaseProperties?.tooltipContent}
      i18n={i18n}
      noTooltip={phase === 'Bound'}
    >
      {phase}
    </StatusBadge>
  );
};

export const PersistentVolumeClaimsList = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('common.headers.status'),
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
