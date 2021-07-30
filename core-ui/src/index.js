import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import i18nextBackend from 'i18next-http-backend';
import yaml from 'js-yaml';

import './index.scss';
import './fiori-helpers.scss';
import App from './components/App/App';
// NOTE react-shared has to be imported after App for some unknown reason
import { Microfrontend, Spinner } from 'react-shared';

import '@ui5/webcomponents-fiori/dist/Wizard.js';

import '@ui5/webcomponents/dist/Button.js';
import '@ui5/webcomponents/dist/FileUploader.js';
import '@ui5/webcomponents/dist/Select.js';
import '@ui5/webcomponents/dist/Option.js';
import '@ui5/webcomponents/dist/TextArea.js';

import '@ui5/webcomponents-icons/dist/hint.js';
import '@ui5/webcomponents-icons/dist/product.js';
import '@ui5/webcomponents-icons/dist/upload.js';
// import "@ui5/webcomponents-icons/dist/AllIcons.js"; ?

// import "@ui5/webcomponents-base/src/browsersupport/IE11"; add support for edge and ie

//add webpack cofnig!

i18next
  .use(initReactI18next)
  .use(i18nextBackend)
  .init({
    lng: false,
    fallbackLng: false,
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
