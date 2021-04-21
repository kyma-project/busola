import React from 'react';

import { LayoutPanel } from 'fundamental-react';

import { Wrapper } from './styled';

const BackendModuleDisabled = ({ mod }) => (
  <Wrapper>
    <LayoutPanel>
      <LayoutPanel.Body>{`${mod} backend module is disabled.`}</LayoutPanel.Body>
    </LayoutPanel>
  </Wrapper>
);

export default BackendModuleDisabled;
