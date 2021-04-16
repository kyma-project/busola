import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext, useShowSystemNamespaces } from 'react-shared';
import { LayoutPanel, Switch } from 'fundamental-react';

export default function NamespaceSettings() {
  const { groups } = useMicrofrontendContext();

  const [showSystemNamespaces, setShowSystemNamespaces] = React.useState(
    useShowSystemNamespaces(),
  );

  const toggleVisibility = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.showSystemNamespaces',
      showSystemNamespaces: !showSystemNamespaces,
    });
    setShowSystemNamespaces(!showSystemNamespaces);
  };

  const shouldShowNamespaceSettings = () => {
    if (!Array.isArray(groups)) {
      return true;
    }
    return groups.includes('runtimeAdmin');
  };

  return (
    shouldShowNamespaceSettings() && (
      <LayoutPanel className="fd-has-margin-tiny fd-has-margin-top-medium">
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Namespace settings" />
          <LayoutPanel.Actions>
            Show System Namespaces
            <Switch
              inputProps={{ 'aria-label': 'toggle-system-namespaces' }}
              className="fd-has-display-inline-block fd-has-margin-left-tiny"
              checked={showSystemNamespaces}
              onChange={toggleVisibility}
            />
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
      </LayoutPanel>
    )
  );
}
