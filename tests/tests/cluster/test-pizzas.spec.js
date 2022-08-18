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
  });

  it('Displays the Pizza Orders list/detail views from the samples', () => {
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
      .contains('a', 'pizzas')
      .click();

    cy.get('@nav')
      .contains('Lunch')
      .click();

    cy.get('@nav')
      .contains('Pizza Orders')
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

  it('Edits a Pizza Order', () => {
    cy.getIframeBody().as('iframe');

    cy.get('@iframe')
      .contains('button:visible', 'Edit')
      .click();

    cy.getIframeBody()
      .find('.fd-dialog__content')
      .as('form');

    cy.get('@form').contains('Name');
    cy.get('@form').contains('Labels');
    cy.get('@form').contains('Annotations');
    cy.get('@form').contains('Description');
    cy.get('@form')
      .find('[data-testid="spec.status"]:visible')
      .find('input')
      .type(`{backspace}{backspace}{backspace}{backspace}{backspace}`)
      .type('Error');

    cy.get('@form').contains('Status');
    cy.get('@form').contains('Order Details');
    cy.get('@form').contains('Pizzas');
    cy.get('@form')
      .find('.fd-form-label--required:visible')
      .should('have.length', 3);

    cy.get('@form')
      .contains('button:visible', 'Update')
      .click();

    cy.get('@iframe')
      .contains('span', /^READY$/i)
      .should('not.exist');

    cy.get('@iframe')
      .contains('span', /^ERROR$/i)
      .should('be.visible');
  });

  it('Displays the Pizzas list/detail views from the samples', () => {
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

    cy.get('@iframe').contains('Margherita is a simple, vegetarian pizza.');
    cy.get('@iframe').contains('Toppings price');
  });

  it('Tests the Create Form', () => {
    cy.getIframeBody()
      .contains('Create Pizza')
      .click();

    cy.getIframeBody()
      .find('.fd-dialog__content')
      .as('form');

    cy.get('@form')
      .find('[data-testid="spec.description"]:visible')
      .type(PIZZA_DESC);

    cy.get('@form')
      .find('[data-testid="spec.sauce"]:visible')
      .find('input')
      .type(SAUCE);

    cy.get('@form')
      .find('[data-testid="spec.recipeSecret"]:visible')
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
});
