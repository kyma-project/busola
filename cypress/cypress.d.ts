/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to mount a React component with common providers
     * @param component - React component to mount
     * @param options - Options for mount, may include initializeRecoil function
     * @example cy.mount(<MyComponent />, { initializeRecoil: (snapshot) => {...} })
     */
    mount(
      component: React.ReactNode,
      options?: {
        initializeRecoil?: (snapshot: any) => void;
        [key: string]: any;
      },
    ): Chainable<any>;
  }
}
