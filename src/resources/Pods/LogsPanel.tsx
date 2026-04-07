import { Text } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

interface LogsPanelProps {
  streamData: {
    error: Error | null;
    data: string[];
  };
  containerName: string;
  searchQuery: string;
  reverseLogs: boolean;
  showTimestamps: boolean;
}

function highlightSearch(log: string, searchText: string) {
  if (searchText) {
    const logArray = log.split(new RegExp(`(${searchText})`, 'gi'));
    return (
      <span>
        {logArray.map((part, idx) =>
          part?.toLowerCase() === searchText?.toLowerCase() ? (
            <b key={idx} className="logs-highlighted">
              {part}
            </b>
          ) : (
            part
          ),
        )}
      </span>
    );
  }
  return <span>{log}</span>;
}

export const LogsPanel = ({
  streamData,
  containerName,
  searchQuery,
  reverseLogs,
  showTimestamps,
}: LogsPanelProps) => {
  const { t } = useTranslation();
  const { error, data } = streamData;
  if (error) return <div className="empty-logs">{error.message}</div>;

  if (data.length === 0)
    return (
      <div className="empty-logs">
        <Text>
          {t('pods.message.no-logs-available', {
            containerName: containerName,
          })}
        </Text>
      </div>
    );

  const newData = reverseLogs ? [...data].reverse() : [...data];

  return newData.map((arr, idx) => {
    const timestamp = arr.split(' ')[0];
    const stream = arr.replace(timestamp, '');
    const log = showTimestamps ? `${timestamp} ${stream}` : stream;
    const highlightedLog = highlightSearch(log, searchQuery);
    return (
      <div className="logs" key={idx}>
        {highlightedLog}
      </div>
    );
  });
};
