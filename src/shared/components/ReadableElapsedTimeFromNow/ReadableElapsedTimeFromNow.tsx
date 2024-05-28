import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const toSeconds = 1000;
const toMinutes = 60;
const toHours = 60;
const toDays = 24;

export const getElapsedTime = (
  timestamp: string,
  valueUnit: string,
): string => {
  if (!timestamp) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  const startDate = new Date(timestamp);
  const now = new Date();
  const timeDiff = now.valueOf() - startDate.valueOf();

  const timeDiffDays = Math.round(
    timeDiff / toSeconds / toMinutes / toHours / toDays,
  );
  return timeDiffDays.toString() + ' ' + valueUnit;
};

export const ReadableElapsedTimeFromNow = ({
  timestamp,
  valueUnit,
}: {
  timestamp: string;
  valueUnit: string;
}): JSX.Element => {
  return <>{getElapsedTime(timestamp, valueUnit)}</>;
};
