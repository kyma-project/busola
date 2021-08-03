import React from 'react';
import { ReadableCreationTimestamp } from 'react-shared';

export function CronJobLastScheduleTime({ lastScheduleTime }) {
  if (!lastScheduleTime) {
    return 'Not scheduled yet';
  }
  return <ReadableCreationTimestamp timestamp={lastScheduleTime} />;
}
