import { Text } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

export function PodTemplateRow({ label, component }) {
  return (
    <div className="pod-template-row" style={spacing.sapUiSmallMargin}>
      <Text className="pod-template-row-label bsl-has-color-status-4">
        {label + ':'}
      </Text>
      {component}
    </div>
  );
}
