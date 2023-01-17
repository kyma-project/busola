import React from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

const createPhaseProperties = (phase, t) => {
  switch (phase) {
    case 'Bound':
      return {
        type: 'success',
        tooltipContent: t('persistent-volume-claims.tooltips.bound'),
      };
    case 'Lost':
      return {
        type: 'error',
        tooltipContent: t('persistent-volume-claims.tooltips.lost'),
      };
    case 'Pending':
      return {
        type: 'warning',
        tooltipContent: t('persistent-volume-claims.tooltips.pending'),
      };
    default:
      return { type: 'info' };
  }
};

export const PersistentVolumeClaimStatus = ({ phase }) => {
  const { t } = useTranslation();
  const phaseProperties = createPhaseProperties(phase, t);

  return (
    <StatusBadge
      resourceKind="persistentvolumeclaim"
      type={phaseProperties.type}
      tooltipContent={phaseProperties?.tooltipContent}
    >
      {phase}
    </StatusBadge>
  );
};
