/* global Cypress */
import React from 'react';
import { mount } from 'cypress/react';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import jsYaml from 'js-yaml';

import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import enYaml from '../../public/i18n/en.yaml?raw';

type ProfilerEntry = {
  phase: string;
  actualDuration: number;
  baseDuration: number;
};

const translations = jsYaml.load(enYaml) as Record<string, unknown>;

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: false,
  nsSeparator: '::',
  defaultNS: 'translation',
  resources: { en: { translation: translations } },
  interpolation: { escapeValue: false },
});

function JotaiHydrator({
  children,
  atomValues = [],
}: {
  children: React.ReactNode;
  atomValues?: Array<[any, any]>;
}) {
  useHydrateAtoms(atomValues);
  return <>{children}</>;
}

const DataRouterWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = createMemoryRouter([{ path: '/*', element: children }], {
    initialEntries: ['/'],
  });
  return <RouterProvider router={router} />;
};

Cypress.Commands.add(
  'mountWithProfiler',
  (component, { initializeJotai, ...options } = {}) => {
    const collected: ProfilerEntry[] = [];

    const wrapped = (
      <React.Profiler
        id="perf"
        onRender={(id, phase, actualDuration, baseDuration) => {
          collected.push({ phase, actualDuration, baseDuration });
        }}
      >
        {component}
      </React.Profiler>
    );

    return mount(
      <Provider>
        <JotaiHydrator atomValues={initializeJotai}>
          <I18nextProvider i18n={i18n}>
            <DataRouterWrapper>
              <ThemeProvider>{wrapped}</ThemeProvider>
            </DataRouterWrapper>
          </I18nextProvider>
        </JotaiHydrator>
      </Provider>,
      options,
    ).then(() => {
      cy.wrap(collected, { log: false }).as('profilerData');
    });
  },
);
