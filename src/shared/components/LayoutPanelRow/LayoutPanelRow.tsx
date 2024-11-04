import { ReactNode } from 'react';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { Text } from '@ui5/webcomponents-react';

import './LayoutPanelRow.scss';

type LayoutPanelRowProps = {
  name: string;
  value: string | ReactNode;
  capitalize?: boolean;
};

export function LayoutPanelRow({
  name,
  value,
  capitalize = false,
}: LayoutPanelRowProps) {
  const sanitizedValue = stringifyIfBoolean(value);

  return (
    <div
      className="break-word layout-panel-row sap-margin-y-tiny sap-margin-x-small"
      style={{
        ...(capitalize ? { textTransform: 'capitalize' } : {}),
      }}
    >
      <Text className="sap-margin-bottom-tiny">{name}</Text>
      {sanitizedValue && <Text>{sanitizedValue}</Text>}
    </div>
  );
}
