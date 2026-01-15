/* global Cypress */
import { mount } from 'cypress/react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

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

// Component to initialize Jotai atoms with test data
function JotaiHydrator({ children, atomValues = [] }) {
  useHydrateAtoms(atomValues);
  return children;
}

Cypress.Commands.add(
  'mount',
  (component, { initializeJotai, ...options } = {}) => {
    return mount(
      <Provider>
        <JotaiHydrator atomValues={initializeJotai}>
          <I18nextProvider i18n={i18n}>
            <MemoryRouter>
              <ThemeProvider>{component}</ThemeProvider>
            </MemoryRouter>
          </I18nextProvider>
        </JotaiHydrator>
      </Provider>,
      options,
    );
  },
);
