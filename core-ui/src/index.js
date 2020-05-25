import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import { preloadingStrategy } from '@kyma-project/common';
import './index.scss';
import App from './components/App/App';
import { Microfrontend } from 'react-shared';

import {
  ApolloClientProvider,
  createKymaApolloClient,
  createCompassApolloClient,
} from './apollo';

export const CompassGqlContext = React.createContext(null);
const CompassGqlProvider = ({ client, children }) => (
  <CompassGqlContext.Provider value={client}>
    {children}
  </CompassGqlContext.Provider>
);

preloadingStrategy(async () => {
  ReactDOM.render(
    <Microfrontend env={process.env}>
      <ApolloClientProvider createClient={createKymaApolloClient}>
        <ApolloClientProvider
          createClient={createCompassApolloClient}
          provider={CompassGqlProvider}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ApolloClientProvider>
      </ApolloClientProvider>
    </Microfrontend>,
    document.getElementById('root'),
  );
});
