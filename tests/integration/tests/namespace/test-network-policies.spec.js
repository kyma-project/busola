/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const RANDOM_NUMBER = Math.random()
  .toString()
  .substr(2, 8);

const NAME = 'test-' + RANDOM_NUMBER;
async function loadNetworkPolicy(name, namespace) {
  const NP = await loadFile('test-network-policy.yaml');
  const newNetworkPolicy = { ...NP };
  newNetworkPolicy.metadata.name = name;
  newNetworkPolicy.metadata.namespace = namespace;

  return newNetworkPolicy;
}

context('Test Network Policy', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Network Policy', () => {
    cy.navigateTo('Discovery and Network', 'Network Policies');

    cy.contains('Create Network Policy').click();

    cy.wrap(loadNetworkPolicy(NAME, Cypress.env('NAMESPACE_NAME'))).then(
      NP_CONFIG => {
        const NP = JSON.stringify(NP_CONFIG);
        cy.pasteToMonaco(NP);
      },
    );

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check Network Policy details', () => {
    cy.contains(NAME).should('be.visible');

    cy.contains(/CIDR/i).should('be.visible');

    cy.contains(/Protocol/i).should('be.visible');
  });

  it('Check Network Policy list', () => {
    cy.inspectList('Network Policies', NAME);
  });
});
