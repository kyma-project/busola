import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { Microfrontend, Spinner } from 'react-shared';
import i18nextBackend from 'i18next-http-backend';
import yaml from 'js-yaml';

import './index.scss';
import './fiori-helpers.scss';
import App from './components/App/App';

const queryParams = new URLSearchParams(window.location.search);
export const i18n = i18next
  .use(initReactI18next)
  .use(i18nextBackend)
  .init({
    lng: queryParams.get('language') || 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: '/i18n/{{lng}}.yaml',
      parse: data => yaml.load(data),
    },
  });

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<Spinner />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
