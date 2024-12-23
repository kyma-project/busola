/* global cy */
import { ControlledBy } from '../ControlledBy';

describe('ControlledBy', () => {
  it('Renders ControlledBy component', () => {
    const owners = [
      {
        apiVersion: 'v1',
        kind: 'Pod',
        name: 'pod-name',
      },
      {
        apiVersion: 'v1',
        kind: 'Function',
        name: 'function-name',
      },
    ];

    cy.mount(<ControlledBy value={owners} />);

    cy.get('ul.controlled-by-list')
      .should('have.length', 1)
      .should('be.visible');
  });

  it('Renders ControlledBy with kindOnly component', () => {
    const owners = [
      {
        apiVersion: 'v1',
        kind: 'Pod',
        name: 'pod-name',
      },
      {
        apiVersion: 'v1',
        kind: 'Function',
        name: 'function-name',
      },
    ];

    cy.mount(<ControlledBy structure={{ kindOnly: true }} value={owners} />);

    cy.get('ul.controlled-by-list')
      .should('have.length', 1)
      .should('be.visible');
  });
});
