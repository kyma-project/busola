/* global cy, describe, it */
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders status text with proper role', () => {
    cy.mount(<StatusBadge>Initial</StatusBadge>);

    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', 'Initial');
  });

  it('displays warning when autoResolveType is set and "children" is a node', () => {
    cy.spy(console, 'warn').as('consoleWarn');

    cy.mount(
      <StatusBadge autoResolveType>
        <small>Status</small>
      </StatusBadge>,
    );

    cy.get('@consoleWarn').should('have.been.calledOnce');
    cy.get('@consoleWarn').its('firstCall.args').should('exist');
  });

  it('renders status text without tooltip', () => {
    cy.mount(<StatusBadge noTooltip>Initial</StatusBadge>);

    cy.get('[data-testid="no-tooltip"]').should('be.visible');
  });

  it('renders status text with tooltip', () => {
    cy.mount(<StatusBadge tooltipContent="hey">Initial</StatusBadge>);

    cy.get('[data-testid="has-tooltip"]').should('be.visible');
  });
});
