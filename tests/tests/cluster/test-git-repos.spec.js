/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';

const PIZZA_NAME = 'hawaiian';
const SAUCE = 'TOMATO';
const PIZZA_DESC = 'Hawaiian pizza is a pizza originating in Canada.';
const RECIPE = 'margherita-recipe';

context('Test Git Repositories', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
    });
    cy.createNamespace('pizzas');
  });

  beforeEach(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
  });

  it('Creates the EXT git repositories config', () => {
    cy.getIframeBody().as('iframe');

    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.get('@iframe')
      .contains('Upload YAML')
      .click();

    cy.loadFiles('examples/pizzas/configuration/gitrepositories.yaml').then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.get('@iframe')
      .contains('Submit')
      .click();

    cy.get('@iframe')
      .find('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 4);
  });

  it('Displays the Git repositories list/detail views from the samples', () => {
    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
    });
    cy.getLeftNav()
      .as('nav')
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .as('iframe')
      .contains('a', 'default')
      .click();

    cy.get('@nav')
      .contains('Custom Resources')
      .click();

    cy.get('@nav')
      .contains('Git repositories')
      .click();

    cy.get('@iframe').contains('DELIVERY');
    cy.get('@iframe').contains('CASH');
    cy.get('@iframe').contains('a', 'extensibility docs');
    cy.get('@iframe')
      .contains('a', 'margherita-order')
      .should('be.visible');

    cy.get('@iframe')
      .contains('a', 'diavola-order')
      .click({ force: true });

    cy.get('@iframe').contains('paymentMethod: CARD');
    cy.get('@iframe').contains('realization=SELF-PICKUP');
    cy.get('@iframe').contains('h3', 'Pizzas');
  });
});
