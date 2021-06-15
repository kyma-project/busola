import React from 'react';
import { LayoutPanel } from 'fundamental-react';

export const ErrorPanel = ({ error, title }) => {
  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title || 'Error'} />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        {error || 'An error occured. The component cannot be rendered.'}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
