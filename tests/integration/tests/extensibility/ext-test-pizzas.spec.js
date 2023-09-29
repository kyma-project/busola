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
    cy.handleExceptions();

    cy.loginAndSelectCluster();

    cy.createNamespace('pizzas');
  });

  it('Creates the EXT pizza config', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles(
      'examples/pizzas/configuration/pizzas-configmap.yaml',
      'examples/pizzas/configuration/pizza-orders-configmap.yaml',
      'examples/pizzas/configuration/pizzas-crd.yaml',
      'examples/pizzas/configuration/pizza-orders-crd.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Submit')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 4);

    cy.loadFiles(
      'examples/pizzas/samples/pizzas-samples.yaml',
      'examples/pizzas/samples/pizza-orders-samples.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Submit')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 6);
  });

  it('Displays the Pizza Orders list/detail views from the samples', () => {
    cy.loginAndSelectCluster();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('a', 'pizzas').click();

    cy.getLeftNav()
      .contains('Lunch')
      .click();

    cy.getLeftNav()
      .contains('Pizza Orders')
      .click();

    cy.contains('DELIVERY');
    cy.contains('CASH');
    cy.contains('a', 'extensibility docs');
    cy.contains('a', 'margherita-order').should('be.visible');

    cy.contains('a', 'diavola-order').click({ force: true });

    cy.contains('paymentMethod: CARD');
    cy.contains('realization=SELF-PICKUP');
    cy.contains('ui5-breadcrumbs', 'Pizza Orders');
  });

  it('Edits a Pizza Order', () => {
    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog').as('form');

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
      .get('ui5-button')
      .contains('Update')
      .should('be.visible')
      .click();

    cy.contains('span', /^READY$/i).should('not.exist');

    cy.contains('span', /^ERROR$/i).should('be.visible');
  });

  it('Displays the Pizzas list/detail views from the samples', () => {
    cy.contains('a', 'pizzas/diavola').click({ force: true });

    cy.contains('Hot salami, Pickled jalapeños, Cheese').should('be.visible');

    cy.contains('Diavola is such a spicy pizza').should('be.visible');

    cy.getLeftNav()
      .contains(/^Pizzas$/)
      .click();

    cy.get('[role=row]').should('have.length', 2);

    cy.contains('Margherita is a simple, vegetarian pizza.');
    cy.contains('Toppings price');
  });

  it('Tests the Create Form', () => {
    cy.contains('ui5-button', 'Create Pizza').click();

    cy.get('ui5-dialog').as('form');

    cy.get('@form')
      .find('[data-testid="spec.description"]:visible')
      .click()
      .clear()
      .type(PIZZA_DESC);

    cy.get('@form')
      .find('[data-testid="spec.sauce"]:visible')
      .find('input')
      .clear()
      .type(SAUCE);

    cy.get('@form')
      .find('[data-testid="spec.recipeSecret"]:visible')
      .type(RECIPE);

    cy.get('@form').contains('Owner References');

    cy.get('@form')
      .find('[arialabel="Pizza name"]:visible')
      .clear()
      .type(PIZZA_NAME);

    cy.get('@form')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();

    cy.contains('ui5-title', PIZZA_NAME).should('be.visible');
  });
});
