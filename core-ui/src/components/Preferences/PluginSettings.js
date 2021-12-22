import React, { useState } from 'react';
import { useMicrofrontendContext } from 'react-shared';
import { Tokens } from 'shared/components/Tokens';
import LuigiClient from '@luigi-project/client';
import { LayoutPanel, Switch } from 'fundamental-react';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { PluginStatus } from './PluginStatus';

export default function PluginSettings() {
  const microfrontendContext = useMicrofrontendContext();
  const [plugins, setPlugins] = useState(microfrontendContext.plugins);

  const applyChanges = () => {
    // we can't clone object containing a function
    const pluginsWithoutResolved = plugins.map(plugin => {
      const { resolved, ...p } = plugin;
      return p;
    });

    LuigiClient.sendCustomMessage({
      id: 'busola.set-plugins',
      plugins: pluginsWithoutResolved,
    });
  };

  return (
    <div>
      <ul>
        {(plugins || []).map(plugin => (
          <LayoutPanel key={plugin.name} className="fd-margin--sm">
            <LayoutPanel.Header>
              <LayoutPanel.Head
                title={plugin.name}
                description={plugin.description}
              />
              <LayoutPanel.Actions>
                Enabled
                <Switch
                  compact
                  checked={plugin.isEnabled}
                  onChange={() => {
                    plugin.isEnabled = !plugin.isEnabled;
                    setPlugins([...plugins]);
                    applyChanges();
                  }}
                />
              </LayoutPanel.Actions>
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              <LayoutPanelRow
                name="Tags"
                value={<Tokens tokens={plugin.tags} />}
              />
              <LayoutPanelRow
                name="Status"
                value={<PluginStatus plugin={plugin} />}
              />
            </LayoutPanel.Body>
          </LayoutPanel>
        ))}
      </ul>
    </div>
  );
}
