import { useTranslation } from 'react-i18next';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';

export const SubscriptionConditionStatus = ({ condition }) => {
  const { t } = useTranslation();
  const statusBadgeProperties =
    condition?.status === 'True'
      ? {
          type: 'Positive',
          text: t('common.statuses.ready'),
        }
      : {
          type: 'Negative',
          text: t('common.statuses.error'),
        };
  return (
    <StatusBadge
      additionalContent={condition?.message}
      resourceKind="subscription"
      type={statusBadgeProperties.type}
    >
      {statusBadgeProperties.text}
    </StatusBadge>
  );
};
