/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';

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

    cy.getIframeBody()
      .contains('Create Network Policy')
      .click();

    cy.wrap(loadNetworkPolicy(NAME, Cypress.env('NAMESPACE_NAME'))).then(
      NP_CONFIG => {
        const NP = JSON.stringify(NP_CONFIG);

        cy.getIframeBody()
          .find('div.view-lines')
          .clearInput()
          .type(NP, {
            parseSpecialCharSequences: false,
            waitForAnimations: false,
          });
      },
    );

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check Network Policy details', () => {
    cy.getIframeBody()
      .contains(NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/CIDR/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/Protocol/i)
      .should('be.visible');
  });

  it('Check Network Policy list', () => {
    cy.getLeftNav()
      .find('[data-testid=networkpolicies_networkpolicies]')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(NAME, { force: true });

    cy.getIframeBody()
      .contains('tbody tr td a', NAME)
      .click({ force: true });
  });
});
