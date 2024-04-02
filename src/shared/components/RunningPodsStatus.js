import { useTranslation } from 'react-i18next';
import { StatusBadge } from './StatusBadge/StatusBadge';

export function RunningPodsStatus({ running, expected }) {
  const { t } = useTranslation();
  const tooltip =
    running === 1
      ? t('common.tooltips.running-pods-singular')
      : t('common.tooltips.running-pods-plural', { running });
  const statusType = running === expected ? 'Success' : 'Error';

  return (
    <StatusBadge
      type={statusType}
      tooltipContent={tooltip}
    >{`${running} / ${expected}`}</StatusBadge>
  );
}
