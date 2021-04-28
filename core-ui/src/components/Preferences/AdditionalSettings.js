import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { LayoutPanel, Switch, Button } from 'fundamental-react';

export default function AdditionalSettings() {
  const context = useMicrofrontendContext();

  const updateSettings = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.bebEnabled',
      bebEnabled: context.bebEnabled,
    });
  };

  return (
    <LayoutPanel className="fd-margin--tiny fd-margin-top--sm">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Additional Settings" />
        <LayoutPanel.Actions>
          <Button option="emphasized" onClick={updateSettings}>
            Update configuration
          </Button>
        </LayoutPanel.Actions>
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
            onChange={() => (context.bebEnabled = !context.bebEnabled)}
          />
        </div>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
