import { useTranslation } from 'react-i18next';
import { StatusBadge } from './StatusBadge/StatusBadge';

interface RunningPodsStatusProps {
  running: number;
  expected: number;
}
export function RunningPodsStatus({
  running,
  expected,
}: RunningPodsStatusProps) {
  const { t } = useTranslation();
  const tooltip =
    running === 1
      ? t('common.tooltips.running-pods-singular')
      : t('common.tooltips.running-pods-plural', { running });
  const statusType = running === expected ? 'Positive' : 'Negative';

  return (
    <StatusBadge
      type={statusType}
      tooltipContent={tooltip}
    >{`${running} / ${expected}`}</StatusBadge>
  );
}
