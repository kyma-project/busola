import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const options: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const withTimeOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

// locale undefined = user's browser locale
export const getReadableTimestamp = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleDateString(undefined, options);
  return formattedDate;
};

export const getReadableTimestampWithTime = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleString(
    undefined,
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
