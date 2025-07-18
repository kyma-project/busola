import { Text } from '@ui5/webcomponents-react';
import './TimestampLabel.scss';

interface TimestampLabelProps {
  time: Date | null;
}

export default function TimestampLabel({ time }: TimestampLabelProps) {
  return (
    <div className="timestamp-label">
      <Text className="timestamp-label-text">
        <b>{'Today'} </b>
        {time &&
          time.toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
          })}
      </Text>
    </div>
  );
}
