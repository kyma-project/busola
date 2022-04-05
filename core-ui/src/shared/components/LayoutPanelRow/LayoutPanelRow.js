import React from 'react';
import './LayoutPanelRow.scss';

export function LayoutPanelRow({ name, value }) {
  return (
    <div className="break-word fd-margin-bottom--tiny layout-panel-row">
      <div className="layout-panel-row__name">{name}</div>
      {value}
    </div>
  );
}
