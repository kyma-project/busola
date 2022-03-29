import React from 'react';
import { Spinner } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';

const Skeleton = ({ height, width = '100%' }) => {
  return (
    <LayoutPanel style={{ width, height }}>
      <LayoutPanel.Body>
        <Spinner compact={true} />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
};

export default Skeleton;
