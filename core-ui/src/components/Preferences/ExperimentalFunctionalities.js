import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext } from 'react-shared';
import { LayoutPanel, Switch } from 'fundamental-react';

export default function ExperimentalFunctionalities() {
  const [showExperimentalViews, setShowExperimentalViews] = React.useState(
    useMicrofrontendContext().showExperimentalViews,
  );

  const toggleVisibility = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.showExperimentalViews',
      showExperimentalViews: !showExperimentalViews,
    });
    setShowExperimentalViews(!showExperimentalViews);
  };

  return (
    <LayoutPanel className="fd-margin--tiny fd-margin-top--sm">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Experimental functionalities" />
        <LayoutPanel.Actions>
          Enable all
          <Switch
            inputProps={{ 'aria-label': 'toggle-experimental' }}
            className="fd-has-display-inline-block fd-margin-begin--tiny"
            checked={showExperimentalViews}
            onChange={toggleVisibility}
          />
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        Enables all views which expose experimental features in the UI. Refresh
        the page after enabling this option to see additional navigation nodes
        in the <strong>Experimental</strong> category of the left navigation.
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
