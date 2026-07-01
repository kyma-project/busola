/* global cy, describe, it */
import { Section } from '../Section';

describe('Section Component', () => {
  it('renders the section title', () => {
    const structure = {
      name: 'My Section',
      children: [],
    };

    cy.mount(<Section structure={structure} value={{}} />);

    cy.get('[data-testid="extensibility-section"]').should('exist');
    cy.get('[data-testid="extensibility-section"] ui5-title').should(
      'contain.text',
      'My Section',
    );
  });

  it('wires aria-labelledby to the title id using structure.name', () => {
    const structure = { name: 'My Section', children: [] };

    cy.mount(<Section structure={structure} value={{}} />);

    cy.get('[data-testid="extensibility-section"]')
      .should('have.attr', 'aria-labelledby', 'section-heading-My Section')
      .then(($section) => {
        const labelId = $section.attr('aria-labelledby');
        cy.get(`#${CSS.escape(labelId)}`).should('exist');
      });
  });

  it('renders children inside the section', () => {
    const structure = {
      name: 'My Section',
      children: [
        { name: 'Field One', source: 'spec.field1' },
        { name: 'Field Two', source: 'spec.field2' },
      ],
    };

    cy.mount(
      <Section
        structure={structure}
        value={{ spec: { field1: 'a', field2: 'b' } }}
      />,
    );

    cy.get(
      '[data-testid="extensibility-section"] .extensibility-section__content',
    )
      .children()
      .should('have.length', 2);
  });

  it('renders with no children when structure has no children', () => {
    const structure = { name: 'Empty Section' };

    cy.mount(<Section structure={structure} value={{}} />);

    cy.get('.extensibility-section__content')
      .children()
      .should('have.length', 0);
  });
});
