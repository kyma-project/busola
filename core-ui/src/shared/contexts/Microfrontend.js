import React from 'react';
import { NotificationProvider } from 'shared/contexts/NotificationContext';
import { MicrofrontendContextProvider } from 'shared/contexts/MicrofrontendContext';

const withProvider = Provider => Component => props => (
  <Provider {...props}>
    <Component {...props} />
  </Provider>
);

export const Microfrontend = [
  MicrofrontendContextProvider,
  NotificationProvider,
].reduce(
  (component, provider) => withProvider(provider)(component),
  ({ children }) => <>{children}</>,
);
