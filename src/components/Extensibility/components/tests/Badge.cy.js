/* global cy */
import { Badge } from '../Badge';

describe('Badge Component', () => {
  it('Renders a badge with a default type', () => {
    const value = 'Unknown';
    const structure = {};

    cy.mount(<Badge value={value} structure={structure} />);

    cy.get('[role="status"]')
      .should('have.length', 1)
      .and('contain.text', 'Unknown')
      .and('have.attr', 'class')
      .and('match', /critical/);
  });

  it('Renders a badge with success type for custom highlights', () => {
    const value = 'yes';
    const structure = {
      highlights: {
        positive: ['yes', 'ok'],
      },
    };

    cy.mount(<Badge value={value} structure={structure} />);

    cy.get('[role="status"]')
      .should('have.length', 1)
      .and('contain.text', 'yes')
      .and('have.attr', 'class')
      .and('match', /positive/);
  });

  it('Renders a badge with error type for custom highlights', () => {
    const value = -2;
    const structure = {
      highlights: {
        negative: 'data < 0',
      },
    };

    cy.mount(<Badge value={value} structure={structure} />);

    cy.get('[role="status"]')
      .should('have.length', 1)
      .and('contain.text', '-2')
      .and('have.attr', 'class')
      .and('match', /negative/);
  });

  it('Renders a custom empty placeholder for empty values', () => {
    const value = null;
    const structure = {
      placeholder: 'empty',
    };

    cy.mount(<Badge value={value} structure={structure} />);

    cy.contains('empty').should('be.visible');
  });

  it('Renders a default placeholder for empty values', () => {
    const value = null;
    const structure = {};

    cy.mount(<Badge value={value} structure={structure} />);

    cy.contains('-').should('be.visible');
  });

  it('Renders a badge with a popover', () => {
    const value = 'yes';
    const structure = {
      description: 'popover',
    };

    cy.mount(<Badge value={value} structure={structure} />);

    cy.get('[data-testid="has-tooltip"]').should('have.length', 1);
    cy.get('[data-testid="has-tooltip"]').click();
    cy.contains('popover').should('be.visible');
  });
});
