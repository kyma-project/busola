import React from 'react';
import './LayoutPanelRow.scss';
import { stringifyIfBoolean } from 'shared/utils/helpers';
import { Text } from '@ui5/webcomponents-react';

export function LayoutPanelRow({ name, value }) {
  const sanitizedValue = stringifyIfBoolean(value);
  return (
    <div className="break-word fd-margin-bottom--tiny layout-panel-row">
      <Text className="fd-margin-bottom--tiny">{name}</Text>
      <Text>{sanitizedValue}</Text>
    </div>
  );
}
