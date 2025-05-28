import { Text } from '@ui5/webcomponents-react';
import './ContextLabel.scss';

interface ContextLabelProps {
  labelText: string;
}

export default function ContextLabel({ labelText }: ContextLabelProps) {
  return (
    <div className="context-label">
      <Text className="context-label-text">{labelText}</Text>
    </div>
  );
}
