import React from 'react';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { Text } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './LayoutPanelRow.scss';

export function LayoutPanelRow({ name, value, children }) {
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
      <div>
        {sanitizedValue && <Text>{sanitizedValue}</Text>}
        {children}
      </div>
    </div>
  );
}
