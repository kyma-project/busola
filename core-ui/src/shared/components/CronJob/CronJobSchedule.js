import React from 'react';
import { Tooltip } from 'react-shared';
import { toString as cRonstrue } from 'cronstrue/i18n';
import { useTranslation } from 'react-i18next';

export function CronJobSchedule({ schedule }) {
  const { i18n } = useTranslation();
  let tooltip;
  try {
    tooltip = cRonstrue(schedule, { locale: i18n.language });
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
