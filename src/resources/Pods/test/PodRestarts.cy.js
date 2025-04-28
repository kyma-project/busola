/* global cy */
import PodRestarts from '../PodRestarts';

describe('PodRestarts', () => {
  beforeEach(() => {
    cy.wait(2000);
  });
  it('Shows 0 for no statuses', () => {
    cy.mount(<PodRestarts statuses={[]} />);

    cy.get('[role="status"]').should('contain.text', '0');
  });

  it('Sums up restart statuses', () => {
    const statuses = [
      { name: 'container-1', restartCount: 10 },
      { name: 'container-2', restartCount: 3 },
    ];

    cy.mount(<PodRestarts statuses={statuses} />);

    cy.get('[role="status"]').should('contain.text', '13');
  });
});
