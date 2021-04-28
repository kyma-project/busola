import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import { Microfrontend, setupMonaco } from 'react-shared';
import './fiori-helpers.scss';

import App from 'components/App/App';

setupMonaco();

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
