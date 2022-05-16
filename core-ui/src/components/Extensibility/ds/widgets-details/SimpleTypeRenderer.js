import { LayoutPanel } from 'fundamental-react';
import React from 'react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function SimpleTypeRenderer({ value, ...props }) {
  if (!value) return null;
  return (
    <LayoutPanel className="fd-margin--md secret-panel">
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={props.ownKey || EMPTY_TEXT_PLACEHOLDER}
          value={typeof value === 'boolean' ? value.toString() : value}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
