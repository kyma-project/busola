import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

function getDayDifference(time1: Date, time2: Date) {
  return (time1.getTime() - time2.getTime()) / (24 * 60 * 60 * 1000);
}

function getHourDifference(time1: Date, time2: Date) {
  return (time1.getTime() - time2.getTime()) / (60 * 60 * 1000);
}

function getMinuteDifference(time1: Date, time2: Date) {
  return (time1.getTime() - time2.getTime()) / (60 * 1000);
}

const rtf = new Intl.RelativeTimeFormat('en', {
  localeMatcher: 'best fit', // other values: "lookup"
  numeric: 'auto', // other values: "auto"
  style: 'long', // other values: "short" or "narrow"
});

export const getReadableTimestamp = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;

  const now = new Date();
  const createdAt = new Date(timestamp);

  const dayDifference = getDayDifference(createdAt, now);
  if (dayDifference < -1) return rtf.format(Math.ceil(dayDifference), 'day');

  const hourDifference = getHourDifference(createdAt, now);
  if (hourDifference < -1) return rtf.format(Math.ceil(hourDifference), 'hour');

  return rtf.format(Math.ceil(getMinuteDifference(createdAt, now)), 'minute');
};

export const ReadableCreationTimestamp = ({
  timestamp,
}: {
  timestamp: string;
}): JSX.Element => <>{getReadableTimestamp(timestamp)}</>;
