import { Text } from '@ui5/webcomponents-react';

interface PodTemplateRowProps {
  label: string;
  component: JSX.Element;
}

export function PodTemplateRow({ label, component }: PodTemplateRowProps) {
  return (
    <div className="pod-template-row sap-margin-small">
      <Text className="pod-template-row-label bsl-has-color-status-4">
        {label + ':'}
      </Text>
      {component}
    </div>
  );
}
