/* global cy, describe, it */
import { Columns } from '../Columns';

describe('Columns Component', () => {
  it('Renders columns with two children', () => {
    const structure = {
      children: [
        {
          name: 'columns.left',
          widget: 'Panel',
          children: [{ path: 'spec.value1' }],
        },
        {
          name: 'columns.right',
          widget: 'Panel',
          children: [{ path: 'spec.value2' }],
        },
      ],
    };

    cy.mount(<Columns structure={structure} />);

    cy.get('[data-testid="extensibility-columns"]')
      .children()
      .should('have.length', 2);
  });

  it('Renders columns with no children when structure is empty', () => {
    const structure = {};

    cy.mount(<Columns structure={structure} />);

    cy.get('[data-testid="extensibility-columns"]')
      .children()
      .should('have.length', 0);
  });
});
