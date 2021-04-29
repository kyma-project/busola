import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { LayoutPanel, Switch } from 'fundamental-react';

export default function AdditionalSettings() {
  const context = useMicrofrontendContext();

  const updateBebEnabled = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.updateBebEnabled',
      bebEnabled: !context.bebEnabled,
    });
  };

  return (
    <LayoutPanel className="fd-margin--tiny fd-margin-top--sm">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Additional Settings" />
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <div
          className="fd-has-display-flex"
          style={{ justifyContent: 'space-between' }}
        >
          BEB integration enabled
          <Switch
            inputProps={{ 'aria-label': 'beb-enabled' }}
            checked={context.bebEnabled}
            onChange={updateBebEnabled}
          />
        </div>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
