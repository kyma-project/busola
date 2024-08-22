import { ReactNode } from 'react';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { Text } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './LayoutPanelRow.scss';

type LayoutPanelRowProps = {
  name: string;
  value: string | ReactNode;
};

export function LayoutPanelRow({ name, value }: LayoutPanelRowProps) {
  const sanitizedValue = stringifyIfBoolean(value);

  return (
    <div
      className="break-word layout-panel-row"
      style={{
        ...spacing.sapUiTinyMarginTopBottom,
        ...spacing.sapUiSmallMarginBeginEnd,
      }}
    >
      <Text style={spacing.sapUiTinyMarginBottom}>{name}</Text>
      <Text>{sanitizedValue}</Text>
    </div>
  );
}
