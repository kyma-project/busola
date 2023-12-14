import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const options: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

export const getReadableTimestamp = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleDateString('en-US', options);
  return formattedDate;
};

export const ReadableCreationTimestamp = ({
  timestamp,
}: {
  timestamp: string;
}): JSX.Element => <>{getReadableTimestamp(timestamp)}</>;
