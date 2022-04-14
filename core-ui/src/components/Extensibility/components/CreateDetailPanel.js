import { LayoutPanel } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { getValue } from './helpers';
import React from 'react';

export const CreateDetailPanel = metadata => resource => {
  return (
    <LayoutPanel className="fd-margin--lg">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={metadata.title} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {metadata.properties.map(prop => (
          <LayoutPanelRow
            key={prop.valuePath}
            name={prop.header}
            value={getValue(resource, prop.valuePath)}
          />
        ))}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
