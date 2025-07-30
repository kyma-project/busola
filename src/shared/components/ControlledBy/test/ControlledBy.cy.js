/* global cy */
import { ControlledBy } from '../ControlledBy';

describe('ControlledBy Component', () => {
  it('Renders placeholders for no owners', () => {
    cy.mount(<ControlledBy />);
    cy.contains('-').should('exist').and('be.visible');

    cy.mount(<ControlledBy placeholder=":(" />);
    cy.contains(':(').should('exist').and('be.visible');
  });

  it('Renders owners - single', () => {
    const owner = {
      kind: 'ResourceKind1',
      name: 'ResourceName1',
    };

    cy.mount(<ControlledBy ownerReferences={owner} />);

    cy.contains('ResourceKind1').should('exist').and('be.visible');
    cy.contains('ResourceName1').should('exist').and('be.visible');
  });

  it('Renders owners - array', () => {
    const owners = [
      { kind: 'ResourceKind1', name: 'ResourceName1' },
      { kind: 'ResourceKind2', name: 'ResourceName2' },
    ];

    cy.mount(<ControlledBy ownerReferences={owners} />);

    cy.contains('ResourceKind1').should('exist').and('be.visible');
    cy.contains('ResourceName1').should('exist').and('be.visible');

    cy.contains('ResourceKind2').should('exist').and('be.visible');
    cy.contains('ResourceName2').should('exist').and('be.visible');
  });

  it('Renders owners - with name', () => {
    const ownerReferences = {
      kind: 'ClusterRole',
      name: 'ResourceName',
      apiVersion: 'ApiVersion',
    };

    cy.mount(<ControlledBy ownerReferences={ownerReferences} />);

    cy.contains('ResourceName').should('exist').and('be.visible');
  });

  it('Renders owners - without name', () => {
    const ownerReferences = [
      {
        kind: 'ResourceKind',
        name: 'ResourceName',
        apiVersion: 'ApiVersion',
      },
    ];

    cy.mount(<ControlledBy ownerReferences={ownerReferences} kindOnly />);

    cy.contains('ResourceName').should('not.exist');

    cy.contains('ResourceKind').should('exist').and('be.visible');
  });
});
