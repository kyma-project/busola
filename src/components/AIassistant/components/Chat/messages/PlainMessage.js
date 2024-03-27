import { Text } from '@ui5/webcomponents-react';
import './PlainMessage.scss';

export default function PlainMessage({ className, message }) {
  return (
    <div className={'plain-message ' + className}>
      <Text className="text">{message}</Text>
    </div>
  );
}
