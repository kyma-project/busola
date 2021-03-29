import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import { preloadingStrategy } from '@kyma-project/common';
import './index.scss';
import App from './components/App/App';
import { Microfrontend } from 'react-shared';

preloadingStrategy(async () => {
  const isNpx = window.location.origin === 'http://localhost:3001';

  ReactDOM.render(
    <Microfrontend env={process.env}>
      <BrowserRouter basename={isNpx ? '/core-ui' : '/'}>
        <App />
      </BrowserRouter>
    </Microfrontend>,
    document.getElementById('root'),
  );
});
