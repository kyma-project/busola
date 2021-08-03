import React from 'react';
import { Tooltip } from 'react-shared';
import { toString as cRonstrue } from 'cronstrue';

export function CronJobSchedule({ schedule }) {
  return (
    <Tooltip position="bottom" content={cRonstrue(schedule)}>
      {schedule}
    </Tooltip>
  );
}
