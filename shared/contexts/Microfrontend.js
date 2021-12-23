import React from 'react';
import { ConfigProvider } from './ConfigContext';
import { NotificationProvider } from './NotificationContext';
import { MicrofrontendContextProvider } from './MicrofrontendContext';
import { PluginRegistryProvider } from './plugins/PluginRegistryContext';
import { ThemeProvider } from './ThemeContext';

const withProvider = Provider => Component => props => (
  <Provider {...props}>
    <Component {...props} />
  </Provider>
);

export const Microfrontend = [
  PluginRegistryProvider,
  MicrofrontendContextProvider,
  ConfigProvider,
  ThemeProvider,
  NotificationProvider,
].reduce(
  (component, provider) => withProvider(provider)(component),
  ({ children }) => <>{children}</>,
);
