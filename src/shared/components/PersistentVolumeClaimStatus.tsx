import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { toSentenceCase } from 'shared/utils/helpers';

interface CreatePhasePropertiesReturnType {
  type: 'Positive' | 'Negative' | 'Critical' | 'Information';
  tooltipContent?: string;
}
const createPhaseProperties = (
  phase: string,
  t: TFunction,
): CreatePhasePropertiesReturnType => {
  switch (phase) {
    case 'Bound':
      return {
        type: 'Positive',
        tooltipContent: t('persistent-volume-claims.tooltips.bound'),
      };
    case 'Lost':
      return {
        type: 'Negative',
        tooltipContent: t('persistent-volume-claims.tooltips.lost'),
      };
    case 'Pending':
      return {
        type: 'Critical',
        tooltipContent: t('persistent-volume-claims.tooltips.pending'),
      };
    default:
      return { type: 'Information' };
  }
};

export const PersistentVolumeClaimStatus = ({ phase }: { phase: string }) => {
  const { t } = useTranslation();
  const phaseProperties = createPhaseProperties(phase, t);

  return (
    <StatusBadge
      resourceKind="persistentvolumeclaim"
      type={phaseProperties.type}
      tooltipContent={phaseProperties?.tooltipContent}
    >
      {toSentenceCase(phase)}
    </StatusBadge>
  );
};
