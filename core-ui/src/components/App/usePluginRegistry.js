import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadExternalModule } from './ExternalModules';
import { useMicrofrontendContext } from 'react-shared';

export const PluginRegistryContext = createContext({});

export function PluginRegistryProvider({ children }) {
  const { plugins: p } = useMicrofrontendContext();
  const [plugins, setPlugins] = useState(p);

  useEffect(() => {
    console.log('plugins changed');
    // todo
    if (!plugins) {
      setPlugins(p);
    }
  }, [p]);

  function loadPlugin(p) {
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
        loadPlugin(plugin);
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
