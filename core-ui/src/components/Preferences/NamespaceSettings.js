import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext, useShowSystemNamespaces } from 'react-shared';
import { LayoutPanel, Switch } from 'fundamental-react';

export default function NamespaceSettings() {
  const { groups } = useMicrofrontendContext();
  const showSystemNamespaces = useShowSystemNamespaces();

  const toggleVisibility = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.showSystemNamespaces',
      showSystemNamespaces: !showSystemNamespaces,
    });
  };

  const shouldShowNamespaceSettings = () => {
    if (!Array.isArray(groups)) {
      return true;
    }
    return groups.includes('runtimeAdmin');
  };

  return (
    shouldShowNamespaceSettings() && (
      <LayoutPanel className="fd-margin--tiny fd-margin-top--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Namespace settings" />
          <LayoutPanel.Actions>
            Show System Namespaces
            <Switch
              inputProps={{ 'aria-label': 'toggle-system-namespaces' }}
              className="fd-has-display-inline-block fd-margin-begin--tiny"
              checked={showSystemNamespaces}
              onChange={toggleVisibility}
            />
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
      </LayoutPanel>
    )
  );
}
