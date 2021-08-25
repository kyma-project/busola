import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext, useShowHiddenNamespaces } from 'react-shared';
import { LayoutPanel, Switch } from 'fundamental-react';

export default function NamespaceSettings() {
  const initialShowHiddenNamespaces = useShowHiddenNamespaces();
  const { groups } = useMicrofrontendContext();
  const [showHiddenNamespaces, setShowHiddenNamespaces] = React.useState(
    useShowHiddenNamespaces(),
  );

  React.useEffect(() => {
    setShowHiddenNamespaces(initialShowHiddenNamespaces);
  }, [initialShowHiddenNamespaces]);

  const toggleVisibility = () => {
    LuigiClient.sendCustomMessage({
      id: 'busola.showHiddenNamespaces',
      showHiddenNamespaces: !showHiddenNamespaces,
    });
    setShowHiddenNamespaces(!showHiddenNamespaces);
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
            Show Hidden Namespaces
            <Switch
              inputProps={{ 'aria-label': 'toggle-hidden-namespaces' }}
              className="fd-has-display-inline-block fd-margin-begin--tiny"
              checked={showHiddenNamespaces}
              onChange={toggleVisibility}
            />
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
      </LayoutPanel>
    )
  );
}
