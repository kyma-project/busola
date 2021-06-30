import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { getErrorMessage } from '../..';

export const ErrorPanel = ({ error, title }) => {
  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={title || 'Error'} />
      </LayoutPanel.Header>
      <LayoutPanel.Body
        style={{
          fontSize: '18px',
        }}
      >
        {getErrorMessage(
          error,
          'An error occured. The component cannot be rendered.',
        )}
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};
