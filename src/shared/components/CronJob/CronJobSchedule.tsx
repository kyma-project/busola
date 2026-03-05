import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import cronstrue from 'cronstrue/i18n';
import { useTranslation } from 'react-i18next';

type CronJobScheduleProps = {
  schedule: string;
};
export function CronJobSchedule({ schedule }: CronJobScheduleProps) {
  const { i18n } = useTranslation();
  let tooltip;
  try {
    tooltip = cronstrue.toString(schedule, { locale: i18n.language });
  } catch (e) {
    console.warn(`Schedule has a wrong type`, e);
    tooltip = '';
  }

  return (
    <Tooltip position="bottom" content={tooltip}>
      {schedule}
    </Tooltip>
  );
}
