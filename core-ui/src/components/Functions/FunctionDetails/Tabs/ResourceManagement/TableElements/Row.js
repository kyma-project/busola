import React from 'react';

import { LayoutPanel } from 'fundamental-react';

export function Row({ title, description, action }) {
  return (
    <LayoutPanel className="has-box-shadow-none">
      <LayoutPanel.Header className="has-padding-none has-none-border-bottom is-block">
        {title && <LayoutPanel.Head title={title} description={description} />}
        <LayoutPanel.Actions>{action}</LayoutPanel.Actions>
      </LayoutPanel.Header>
    </LayoutPanel>
  );
}
