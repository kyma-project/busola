import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadExternalModule } from './ExternalModules';
import { useMicrofrontendContext } from 'react-shared';

export const PluginRegistryContext = createContext({});

export function PluginRegistryProvider({ children }) {
  const microfrontendContext = useMicrofrontendContext();
  const [plugins, setPlugins] = useState(microfrontendContext.plugins);

  // todo make it actually reactive?
  useEffect(() => {
    if (!plugins) {
      setPlugins(microfrontendContext.plugins);
    }
  }, [microfrontendContext.plugins]);

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
      plugins?.filter(p => p.tags.some(tag => tags.includes(tag))) || [];
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
