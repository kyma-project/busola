/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';

const PIZZA_NAME = 'hawaiian';
const SAUCE = 'TOMATO';
const PIZZA_DESC = 'Hawaiian pizza is a pizza originating in Canada.';
const RECIPE = 'margherita-recipe';

context('Test Pizzas', () => {
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

  it('Creates the EXT pizza config', () => {
    cy.getIframeBody().as('iframe');

    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.get('@iframe')
      .contains('Upload YAML')
      .click();

    cy.loadFiles(
      'examples/pizzas/configuration/pizzas-configmap.yaml',
      'examples/pizzas/configuration/pizza-orders-configmap.yaml',
      'examples/pizzas/configuration/pizzas-crd.yaml',
      'examples/pizzas/configuration/pizza-orders-crd.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('@iframe')
      .contains('Submit')
      .click();

    cy.get('@iframe')
      .find('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 4);

    //
    cy.loadFiles('examples/pizzas/samples.yaml').then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('@iframe')
      .contains('Submit')
      .click();

    cy.get('@iframe')
      .find('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 6);

    cy.setBusolaFeature('EXTENSIBILITY', true);

    cy.reload();
  });

  it('Displays the Pizza Orders list/details view from the samples', () => {
    cy.getLeftNav()
      .as('nav')
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .as('iframe')
      .contains('a', 'pizzas')
      .click();

    cy.get('@nav')
      .contains('Lunch')
      .click();

    cy.get('@nav')
      .contains('Pizza Orders')
      .click();

    cy.get('@iframe')
      .contains('a', 'margherita-order')
      .should('be.visible');

    cy.get('@iframe')
      .contains('a', 'diavola-order')
      .click({ force: true });
  });

  it('Displays the Pizzas list/details view for the samples', () => {
    cy.getIframeBody().as('iframe');

    cy.get('@iframe')
      .contains('a', 'pizzas/diavola')
      .click({ force: true });

    cy.get('@iframe')
      .contains('Hot salami, Pickled jalapeños, Cheese')
      .should('be.visible');

    cy.get('@iframe')
      .contains('Diavola is such a spicy pizza')
      .should('be.visible');

    cy.getLeftNav()
      .contains(/^Pizzas$/)
      .click();

    cy.get('@iframe')
      .find('.fd-table__body')
      .find('tr')
      .should('have.length', 2);
  });

  it('Tests the Create Form', () => {
    cy.getIframeBody()
      .contains('Create Pizza')
      .click();

    cy.getIframeBody()
      .find('.fd-dialog__content')
      .as('form');

    cy.get('@form')
      .find('[data-testid="Description"]:visible')
      .type(PIZZA_DESC);

    cy.get('@form')
      .find('[data-testid="Sauce"]:visible')
      .find('input')
      .type(SAUCE);

    cy.get('@form')
      .find('[data-testid="Recipe\'s secret"]:visible')
      .find('input')
      .type(RECIPE);

    cy.get('@form').contains('Owner References');

    cy.get('@form')
      .find('[arialabel="Pizza name"]:visible')
      .type(PIZZA_NAME);

    cy.get('@form')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', PIZZA_NAME)
      .should('be.visible');
  });

  it('Removes the pizza namespace', () => {
    cy.navigateTo('Back to Cluster Details', 'Namespaces');
    cy.deleteFromGenericList('pizzas');
  });
});
