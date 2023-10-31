import React from 'react';
import './LayoutPanelRow.scss';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { Text } from '@ui5/webcomponents-react';

export function LayoutPanelRow({ name, value }) {
  const sanitizedValue = stringifyIfBoolean(value);
  return (
    <div className="break-word bsl-margin-bottom--tiny layout-panel-row">
      <Text className="bsl-margin-bottom--tiny">{name}</Text>
      <Text>{sanitizedValue}</Text>
    </div>
  );
}
