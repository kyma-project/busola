/* global cy */
import { ErrorBoundary } from '../ErrorBoundary';

describe('Error Boundary', () => {
  it('Renders children', () => {
    cy.mount(<ErrorBoundary>hello world</ErrorBoundary>);

    cy.contains('hello world').should('exist');
  });

  it('Renders error component', () => {
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('test')) {
        return false;
      }
      return true;
    });

    const Child = () => {
      throw new Error('test');
    };

    cy.mount(
      <ErrorBoundary displayButton={true}>
        <Child />
      </ErrorBoundary>,
    );

    cy.contains('err-boundary.restored-initial-form').should('exist');
    cy.contains('err-boundary.go-back').should('exist');
  });
});
