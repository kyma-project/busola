import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const options: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const withTimeOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'short',
  timeStyle: 'medium',
  hour12: false,
};

export const getReadableTimestamp = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleDateString('en-US', options);
  return formattedDate;
};

export const getReadableTimestampWithTime = (timestamp: string) => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleString(
    'de-DE',
    withTimeOptions,
  );
  return formattedDate;
};

export const ReadableCreationTimestamp = ({
  timestamp,
}: {
  timestamp: string;
}): JSX.Element => {
  return <>{getReadableTimestampWithTime(timestamp)}</>;
};
