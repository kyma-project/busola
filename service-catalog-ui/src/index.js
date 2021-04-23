import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import { Microfrontend } from 'react-shared';

import App from 'components/App/App';
// import 'fiori-fundamentals/dist/fiori-fundamentals.min.css'; // half of our helper classes is in here

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
