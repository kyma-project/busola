/* global cy, describe, it */
import { Button } from '@ui5/webcomponents-react';
import { UI5Card } from './UI5Card';

describe('UI5Card', () => {
  it('renders the title and children inside a real Card', () => {
    cy.mount(
      <UI5Card title="Card title">
        <div data-testid="content">body</div>
      </UI5Card>,
    );

    cy.get('ui5-card').should('exist');
    cy.get('ui5-card-header').should('have.attr', 'title-text', 'Card title');
    cy.get('[data-testid="content"]').should('contain.text', 'body');
  });

  it('fires a click on a headerActions Button rendered in the toolbar header', () => {
    const onClick = cy.stub().as('clickSpy');

    cy.mount(
      <UI5Card
        title="With actions"
        headerActions={
          <Button data-testid="action-btn" onClick={onClick}>
            Click me
          </Button>
        }
      >
        body
      </UI5Card>,
    );

    cy.get('.bsl-card-toolbar').should('exist');
    cy.get('[data-testid="action-btn"]').click();
    cy.get('@clickSpy').should('have.been.calledOnce');
  });

  it('renders modeActions + headerActions together in the toolbar path', () => {
    cy.mount(
      <UI5Card
        title="Complex"
        modeActions={<span data-testid="mode">mode</span>}
        headerActions={<Button data-testid="header-btn">header</Button>}
      >
        body
      </UI5Card>,
    );

    cy.get('.bsl-card-toolbar').should('exist');
    cy.get('[data-testid="mode"]').should('be.visible');
    // headerActions is rendered twice (invisible duplicate for layout + visible)
    cy.get('.header-actions').should('have.length', 2);
    cy.get('.header-actions.invisible')
      .should('exist')
      .and('have.attr', 'aria-hidden', 'true');
  });

  it('applies sap-margin-small to a nested card but not the outer one', () => {
    cy.mount(
      <UI5Card title="Outer" testid="outer">
        <UI5Card title="Inner" testid="inner">
          nested
        </UI5Card>
      </UI5Card>,
    );

    cy.get('[data-testid="outer"]').should(
      'not.have.class',
      'sap-margin-small',
    );
    cy.get('[data-testid="inner"]').should('have.class', 'sap-margin-small');
  });
});
