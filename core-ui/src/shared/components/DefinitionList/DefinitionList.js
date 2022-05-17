import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import './DefinitionList.scss';

export function DefinitionList({ title, list }) {
  return (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {list.map(({ name, value }) => (
          <LayoutPanelRow name={name} value={value} key={name} />
        ))}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
