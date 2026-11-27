/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    mount(
      component: React.ReactNode,
      options?: {
        initializeJotai?: Array<[any, any]>;
        [key: string]: any;
      },
    ): Chainable<any>;

    /**
     * Mount with React.Profiler — exposes collected render data via @profilerData alias.
     * Use in performance tests only (cypress.config.perf.ts).
     * @example cy.mountWithProfiler(<MyComponent />); cy.get('@profilerData').then(data => ...)
     */
    mountWithProfiler(
      component: React.ReactNode,
      options?: {
        initializeJotai?: Array<[any, any]>;
        [key: string]: any;
      },
    ): Chainable<any>;
  }
}
