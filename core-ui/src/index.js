import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import App from './components/App/App';
import { Microfrontend } from 'react-shared';
// import 'fiori-fundamentals/dist/fiori-fundamentals.min.css'; // half of our helper classes is in here

const isNpx = window.location.origin === 'http://localhost:3001';

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter basename={isNpx ? '/core-ui' : '/'}>
      <App />
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
