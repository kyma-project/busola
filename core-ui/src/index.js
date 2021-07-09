import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import './fiori-helpers.scss';
import App from './components/App/App';
import { Microfrontend } from 'react-shared';

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <App />
      </React.Suspense>
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
