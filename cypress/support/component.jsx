/* global Cypress */
import React from 'react';
import { mount } from 'cypress/react18';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { MemoryRouter } from 'react-router';
import { RecoilRoot } from 'recoil';

import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: false,
  nsSeparator: '::',
  defaultNS: 'translation',
  saveMissing: true,
  interpolation: {
    escapeValue: false,
  },
});

Cypress.Commands.add(
  'mount',
  (component, { initializeRecoil, ...options } = {}) => {
    return mount(
      <RecoilRoot initializeState={initializeRecoil}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <ThemeProvider>{component}</ThemeProvider>
          </MemoryRouter>
        </I18nextProvider>
      </RecoilRoot>,
      options,
    );
  },
);
