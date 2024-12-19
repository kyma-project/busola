/* global cy */
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders status text with proper role', () => {
    cy.mount(<StatusBadge>Initial</StatusBadge>);

    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', 'common.statuses.initial');
  });

  it('displays warning when autoResolveType is set and "children" is a node', () => {
    cy.spy(console, 'warn').as('consoleWarn');

    cy.mount(
      <StatusBadge autoResolveType>
        <small>Status</small>
      </StatusBadge>,
    );

    cy.get('@consoleWarn').should('have.been.calledOnce');
    cy.get('@consoleWarn')
      .its('firstCall.args')
      .should('exist');
  });

  it('renders status text with DEFAULT_STATUSES_PATH', () => {
    const DEFAULT_STATUSES_PATH = 'common.statuses.initial';

    cy.mount(<StatusBadge>Initial</StatusBadge>);

    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', DEFAULT_STATUSES_PATH);
  });

  it('renders status text with RESOURCE_STATUSES_PATH', () => {
    const RESOURCE_KIND = 'resource';
    const RESOURCE_STATUSES_PATH = 'resource.statuses.initial';

    cy.mount(<StatusBadge resourceKind={RESOURCE_KIND}>Initial</StatusBadge>);

    cy.get('[role="status"]')
      .should('be.visible')
      .and('contain.text', RESOURCE_STATUSES_PATH);
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
