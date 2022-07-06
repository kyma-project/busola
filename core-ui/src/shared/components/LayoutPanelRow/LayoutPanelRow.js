import React from 'react';
import './LayoutPanelRow.scss';
import { stringifyIfBoolean } from 'shared/utils/helpers';

export function LayoutPanelRow({ name, value }) {
  const sanitizedValue = stringifyIfBoolean(value);
  return (
    <div className="break-word fd-margin-bottom--tiny layout-panel-row">
      <div className="layout-panel-row__name">{name}</div>
      {sanitizedValue}
    </div>
  );
}
