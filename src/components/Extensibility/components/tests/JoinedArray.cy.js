/* global cy */
import { JoinedArray } from '../JoinedArray';

describe('JoinedArray Component', () => {
  it('renders joined array with default separator', () => {
    const value = ['a', 'b', 'c'];

    cy.mount(<JoinedArray value={value} />);

    cy.contains(/a, b, c/i).should('be.visible');
  });

  it('renders joined array with a custom separator', () => {
    const value = ['a', 'b', 'c'];
    const structure = { separator: '.' };

    cy.mount(<JoinedArray value={value} structure={structure} />);

    cy.contains(/a\.b\.c/i).should('be.visible');
  });

  it('renders placeholder for empty array', () => {
    const value = [];

    cy.mount(<JoinedArray value={value} />);

    cy.contains(/-/i).should('be.visible');
  });

  it('renders placeholder for null value', () => {
    const value = null;

    cy.mount(<JoinedArray value={value} />);

    cy.contains(/-/i).should('be.visible');
  });
});
