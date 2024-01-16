import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { Tooltip } from '../Tooltip/Tooltip';

const options: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const TooltipWrapper = ({ tooltipProps, children }: any) => {
  if (tooltipProps?.content) {
    return <Tooltip {...tooltipProps}>{children}</Tooltip>;
  }
  return children;
};

export const getReadableTimestamp = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleDateString('en-US', options);
  return formattedDate;
};

export const getReadableTimestampWithTime = (timestamp: string): string => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleTimeString('en-US', options);
  return formattedDate;
};

export const ReadableCreationTimestamp = ({
  timestamp,
}: {
  timestamp: string;
}): JSX.Element => {
  return (
    <>
      <TooltipWrapper
        tooltipProps={{
          content: getReadableTimestampWithTime(timestamp),
          position: 'bottom',
        }}
      >
        {getReadableTimestamp(timestamp)}
      </TooltipWrapper>
    </>
  );
};

/*
  <>
    {getReadableTimestampWithTime(timestamp)}
  </>
*/

/*
export const getReadableTimestampWithTime = (timestamp: string) => {
  if (!timestamp) return EMPTY_TEXT_PLACEHOLDER;
  const timestampAsDate = new Date(timestamp);
  const formattedDate = timestampAsDate.toLocaleTimeString('en-US', options);
  const [date, year, time] = formattedDate.split(',');
  return (
    <>
      <p>{`${date}, ${year}`}</p>
      <p>{time}</p>
    </>
  );
};
*/
