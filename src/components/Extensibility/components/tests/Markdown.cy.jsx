/* global cy, describe, it */
import { Markdown } from '../Markdown';

describe('Markdown Component', () => {
  it('renders markdown headings and inline formatting', () => {
    const value = '# Title\n\nSome **bold** text.';

    cy.mount(<Markdown value={value} structure={{}} />);

    cy.get('[data-testid="extensibility-markdown"] h1').should(
      'contain.text',
      'Title',
    );
    cy.get('[data-testid="extensibility-markdown"] strong').should(
      'contain.text',
      'bold',
    );
  });

  it('renders lists', () => {
    const value = '- one\n- two\n- three';

    cy.mount(<Markdown value={value} structure={{}} />);

    cy.get('[data-testid="extensibility-markdown"] li').should(
      'have.length',
      3,
    );
  });

  it('renders the placeholder for an empty value', () => {
    cy.mount(<Markdown value={null} structure={{}} />);

    cy.contains('-').should('be.visible');
  });

  it('escapes embedded HTML instead of executing it', () => {
    const value = 'text <img src=x onerror="window.__xss = true"> more';

    cy.mount(<Markdown value={value} structure={{}} />);

    cy.get('[data-testid="extensibility-markdown"]').should('exist');
    // Raw HTML is rendered as escaped text, so no real element is created.
    cy.get('[data-testid="extensibility-markdown"] img').should('not.exist');
    cy.window().its('__xss').should('be.undefined');
  });
});
