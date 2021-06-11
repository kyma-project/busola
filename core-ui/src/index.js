import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import './fiori-helpers.scss';
import App from './components/App/App';
import { Microfrontend, setupMonaco } from 'react-shared';
import { monaco } from '@monaco-editor/react';

setupMonaco(monaco);

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter basename="/core-ui">
      <App />
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
