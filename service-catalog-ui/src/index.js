import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import { Microfrontend } from 'react-shared';
import './fiori-helpers.scss';

import App from 'components/App/App';

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <App />
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
