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

function getRemainingTime(timestampAsDate: Date, currentDate: Date): string {
  const dayDifference = getDayDifference(timestampAsDate, currentDate);

  if (dayDifference > -1) return rtf.format(Math.ceil(dayDifference), 'day');

  const hourDifference = getHourDifference(timestampAsDate, currentDate);
  if (hourDifference > -1) return rtf.format(Math.ceil(hourDifference), 'hour');

  return rtf.format(
    Math.ceil(getMinuteDifference(timestampAsDate, currentDate)),
    'minute',
  );
}

export const getReadableTimestamp = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;

  const currentDate = new Date();
  const timestampAsDate = new Date(timestamp);

  if (timestampAsDate > currentDate)
    return getRemainingTime(timestampAsDate, currentDate);

  const dayDifference = getDayDifference(timestampAsDate, currentDate);

  if (dayDifference < -1) return rtf.format(Math.ceil(dayDifference), 'day');

  const hourDifference = getHourDifference(timestampAsDate, currentDate);
  if (hourDifference < -1) return rtf.format(Math.ceil(hourDifference), 'hour');

  return rtf.format(
    Math.ceil(getMinuteDifference(timestampAsDate, currentDate)),
    'minute',
  );
};

export const ReadableCreationTimestamp = ({
  timestamp,
}: {
  timestamp: string;
}): JSX.Element => <>{getReadableTimestamp(timestamp)}</>;
