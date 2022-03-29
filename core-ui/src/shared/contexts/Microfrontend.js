import React from 'react';
import { ConfigProvider } from 'shared/contexts/ConfigContext';
import { NotificationProvider } from 'shared/contexts/NotificationContext';
import { MicrofrontendContextProvider } from 'shared/contexts/MicrofrontendContext';
import { ThemeProvider } from 'shared/contexts/ThemeContext';

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
].reduce(
  (component, provider) => withProvider(provider)(component),
  ({ children }) => <>{children}</>,
);
