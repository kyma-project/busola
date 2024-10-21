import { ReactNode } from 'react';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { Text } from '@ui5/webcomponents-react';

import { spacing } from 'shared/helpers/spacing';
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
      className="break-word layout-panel-row"
      style={{
        ...spacing.sapUiTinyMarginTopBottom,
        ...spacing.sapUiSmallMarginBeginEnd,
        ...(capitalize ? { textTransform: 'capitalize' } : {}),
      }}
    >
      <Text style={spacing.sapUiTinyMarginBottom}>{name}</Text>
      {sanitizedValue && <Text>{sanitizedValue}</Text>}
    </div>
  );
}
