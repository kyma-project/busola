import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import { Microfrontend, setupMonaco } from 'react-shared';
import './fiori-helpers.scss';
import { monaco } from '@monaco-editor/react';

import App from 'components/App/App';

setupMonaco(monaco);

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <App />
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
