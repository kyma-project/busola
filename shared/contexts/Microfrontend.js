import React from 'react';
import { ConfigProvider } from './ConfigContext';
import { NotificationProvider } from './NotificationContext';
import { MicrofrontendContextProvider } from './MicrofrontendContext';
import { ThemeProvider } from './ThemeContext';
import { ReplayContextProvider } from './ReplayContext/ReplayContext';

const withProvider = Provider => Component => props => (
  <Provider {...props}>
    <Component {...props} />
  </Provider>
);

export const Microfrontend = [
  MicrofrontendContextProvider,
  ConfigProvider,
  ThemeProvider,
  NotificationProvider,
  ReplayContextProvider,
].reduce(
  (component, provider) => withProvider(provider)(component),
  ({ children }) => <>{children}</>,
);
