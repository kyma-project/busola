import { Text } from '@ui5/webcomponents-react';

export const LogsPanel = ({ streamData, containerName }) => {
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
