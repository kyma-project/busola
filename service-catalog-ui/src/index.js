import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import './fiori-helpers.scss';
import { Microfrontend } from 'react-shared';

import App from 'components/App/App';

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
