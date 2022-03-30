import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import i18nextBackend from 'i18next-http-backend';
import yaml from 'js-yaml';

import App from './components/App/App';

import { Microfrontend } from 'shared/contexts/Microfrontend';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { CommandPaletteProvider } from 'command-pallette/CommandPaletteProvider';
import ServiceCatalogUIWrapper from './service-catalog-ui/Wrapper';

import './index.scss';
import './fiori-helpers.scss';

i18next
  .use(initReactI18next)
  .use(i18nextBackend)
  .init({
    lng: 'en',
    fallbackLng: false,
    backend: {
      loadPath: '/i18n/{{lng}}.yaml',
      parse: data => ({
        ...yaml.load(data),
        fallback: '{{fallback}}',
      }),
    },
    saveMissing: true,
    missingKeyHandler: (_lngs, _ns, key) => {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        console.warn(key);
      }
    },
    interpolation: {
      escapeValue: false, // react already handles the escaping
    },
  });

ReactDOM.render(
  <Microfrontend env={process.env}>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<Spinner />}>
        <CommandPaletteProvider>
          <App />
          <ServiceCatalogUIWrapper />
        </CommandPaletteProvider>
      </Suspense>
    </BrowserRouter>
  </Microfrontend>,
  document.getElementById('root'),
);
