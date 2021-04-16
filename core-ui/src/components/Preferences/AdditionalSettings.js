import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { LayoutPanel, Switch, Button } from 'fundamental-react';

export default function AdditionalSettings() {
  const [bebEnabled, setBebEnabled] = React.useState(
    useMicrofrontendContext().bebEnabled,
  );

  const updateApiUrl = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.bebEnabled',
      bebEnabled,
    });
  };

  return (
    <LayoutPanel className="fd-has-margin-tiny fd-has-margin-top-small">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Additional Settings" />
        <LayoutPanel.Actions>
          <Button option="emphasized" onClick={updateApiUrl}>
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
            checked={bebEnabled}
            onChange={() => setBebEnabled(!bebEnabled)}
          />
        </div>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
