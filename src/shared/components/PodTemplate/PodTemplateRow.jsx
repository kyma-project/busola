import { Text } from '@ui5/webcomponents-react';

export function PodTemplateRow({ label, component }) {
  return (
    <div className="pod-template-row sap-margin-small">
      <Text className="pod-template-row-label bsl-has-color-status-4">
        {label + ':'}
      </Text>
      {component}
    </div>
  );
}
