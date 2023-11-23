import React from 'react';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { Text } from '@ui5/webcomponents-react';

import { spacing } from '@ui5/webcomponents-react-base';
import './LayoutPanelRow.scss';

export function LayoutPanelRow({ name, value }) {
  const sanitizedValue = stringifyIfBoolean(value);
  return (
    <div
      className="break-word layout-panel-row"
      style={spacing.sapUiTinyMarginBottom}
    >
      <Text style={spacing.sapUiTinyMarginBottom}>{name}</Text>
      <Text>{sanitizedValue}</Text>
    </div>
  );
}
