import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'react-shared';

const createPhaseProperties = (phase, t) => {
  switch (phase) {
    case 'Bound':
      return {
        type: 'success',
      };
    case 'Lost':
      return {
        type: 'error',
        tooltipContent: t('persistent-volume-claim.tooltips.lost'),
      };
    case 'Pending':
      return {
        type: 'warning',
        tooltipContent: t('persistent-volume-claim.tooltips.pending'),
      };
    default: {
      return { type: 'info' };
    }
  }
};

export const PersistentVolumeClaimStatus = ({ phase }) => {
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
