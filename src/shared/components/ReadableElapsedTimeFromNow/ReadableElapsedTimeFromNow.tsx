const toSeconds = 1000;
const toMinutes = 60;
const toHours = 60;
const toDays = 24;

export const getElapsedTime = (timestamp: string): string => {
  const startDate = new Date(timestamp);
  const now = new Date();
  const timeDiff = now.valueOf() - startDate.valueOf();

  const timeDiffDays = Math.round(
    timeDiff / toSeconds / toMinutes / toHours / toDays,
  );
  return timeDiffDays.toString() + ' Days';
};

export const ReadableElapsedTimeFromNow = ({
  timestamp,
}: {
  timestamp: string;
}): JSX.Element => {
  return <>{getElapsedTime(timestamp)}</>;
};
