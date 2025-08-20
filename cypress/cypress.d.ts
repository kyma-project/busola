/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mount a React component with common providers
     * @param component - React component to mount
     * @param options - Options for mount, may include initializeJotai function
     * @example cy.mount(<MyComponent />, { initializeJotai: [[atom, value]] })
     */
    mount(
      component: React.ReactNode,
      options?: {
        initializeJotai?: Array<[any, any]>;
        [key: string]: any;
      },
    ): Chainable<any>;
  }
}
