import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadExternalModule } from './ExternalModules';
import { useMicrofrontendContext } from 'react-shared';

export const PluginRegistryContext = createContext({});

export function PluginRegistryProvider({ children }) {
  const microfrontendContext = useMicrofrontendContext();
  const [plugins, setPlugins] = useState(microfrontendContext.plugins);
  // const [resolved, setResolved] =

  // todo!
  useEffect(() => {
    if (!microfrontendContext.plugins) return;
    if (!plugins) {
      setPlugins(microfrontendContext.plugins);
    } else {
      let changed = false;
      for (const plugin of microfrontendContext.plugins) {
        const p = plugins.find(p => p.name === plugin.name);
        if (
          p.isEnabled !== plugin.isEnabled ||
          p.isActive !== plugin.isActive
        ) {
          changed = true;
          p.isEnabled = plugin.isEnabled;
          p.isActive = plugin.isActive;
        }
      }
      if (changed) {
        setPlugins([...plugins]);
      }
    }
  }, [microfrontendContext.plugins]); // eslint-disable-line react-hooks/exhaustive-deps

  function startLoadingPlugin(p) {
    loadExternalModule(p.path)
      .then(resolved => {
        p.resolved = resolved;
        setPlugins(plugins => [...plugins]);
      })
      .catch(e => {
        console.warn('Cannot load plugin', p?.name, e);
      });
  }

  function getByTags(tags) {
    const targetPlugins =
      plugins
        ?.filter(p => p.isActive)
        .filter(p => p.tags.some(tag => tags.includes(tag))) || [];
    const list = [];
    for (const plugin of targetPlugins) {
      if (plugin.resolved) {
        list.push(plugin);
      } else {
        startLoadingPlugin(plugin);
      }
    }
    return list;
  }

  const value = { getByTags };

  return (
    <PluginRegistryContext.Provider value={value}>
      {children}
    </PluginRegistryContext.Provider>
  );
}

export function usePluginRegistry() {
  return useContext(PluginRegistryContext);
}
