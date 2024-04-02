import { BusyIndicator, Text } from '@ui5/webcomponents-react';
import './PlainMessage.scss';

export default function PlainMessage({ className, message, isLoading }) {
  return (
    <div className={'plain-message ' + className}>
      {isLoading && <BusyIndicator active size="Medium" delay={0} />}
      {message && <Text className="text">{message}</Text>}
    </div>
  );
}
