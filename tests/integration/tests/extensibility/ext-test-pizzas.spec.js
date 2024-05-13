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
      .contains('ui5-button', 'Upload')
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
      .contains('ui5-button', 'Upload')
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

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .type('pizzas');

    cy.clickGenericListLink('pizzas');

    cy.getLeftNav()
      .contains('Lunch')
      .click();

    cy.getLeftNav()
      .contains('Pizza Orders')
      .click();

    cy.contains('DELIVERY');
    cy.contains('CASH');
    cy.contains('ui5-link', 'extensibility docs');
    cy.checkItemOnGenericListLink('margherita-order');

    cy.clickGenericListLink('diavola-order');

    cy.contains('paymentMethod: CARD');
    cy.contains('realization: SELF-PICKUP');
  });

  it('Edits a Pizza Order', () => {
    cy.wait(1000);

    cy.getMidColumn().inspectTab('Edit');

    cy.get('.edit-form').as('form');

    cy.get('@form').contains('Name');
    cy.get('@form').contains('Labels');
    cy.get('@form').contains('Annotations');
    cy.get('@form').contains('Description');

    cy.get('@form')
      .find('[data-testid="spec.status"]:visible')
      .find('input')
      .click()
      .type(`{backspace}{backspace}{backspace}{backspace}{backspace}`, {
        force: true,
      })
      .type('Error');

    cy.get('@form').contains('Status');
    cy.get('@form').contains('Order Details');
    cy.get('@form').contains('Pizzas');
    cy.get('@form')
      .find('ui5-label[required]:visible')
      .should('have.length', 3);

    cy.checkUnsavedDialog();

    cy.saveChanges('Edit');

    cy.inspectTab('View');

    cy.getMidColumn()
      .contains('span', /^READY$/i)
      .should('not.exist');

    cy.getMidColumn()
      .contains('span', /^ERROR$/i)
      .should('be.visible');
  });

  it('Displays the Pizzas list/detail views from the samples', () => {
    cy.getMidColumn()
      .contains('ui5-link', 'pizzas/diavola')
      .click({ force: true });

    cy.contains('Hot salami, Pickled jalapeños, Cheese').should('be.visible');

    cy.contains('Diavola is such a spicy pizza').should('be.visible');

    cy.getLeftNav()
      .contains(/^Pizzas$/)
      .click();

    cy.get('ui5-table-row').should('have.length', 2);

    cy.contains('Margherita is a simple, vegetarian pizza.');
    cy.contains('Toppings price');
  });

  it('Test list sort-functionality', () => {
    cy.get('ui5-table-row')
      .eq(0)
      .should('contain.text', 'margherita');

    cy.get('ui5-table-row')
      .eq(1)
      .should('contain.text', 'diavola');

    cy.get('ui5-button[aria-label="open-sort"]').click();

    cy.get('ui5-radio-button[name="sortOrder"][text="Descending"]').click();

    cy.get('ui5-button')
      .contains('OK')
      .click();

    cy.get('ui5-table-row')
      .eq(0)
      .should('contain.text', 'diavola');

    cy.get('ui5-table-row')
      .eq(1)
      .should('contain.text', 'margherita');

    cy.get('ui5-button[aria-label="open-sort"]').click();

    cy.get('ui5-radio-button[name="sortBy"][text="Name"]').click('left');

    cy.get('ui5-button')
      .contains('OK')
      .click();

    cy.get('ui5-table-row')
      .eq(0)
      .should('contain.text', 'margherita');

    cy.get('ui5-table-row')
      .eq(1)
      .should('contain.text', 'diavola');
  });

  it('Tests the Create Form', () => {
    cy.contains('ui5-button', 'Create').click();

    cy.get('.create-form').as('form');

    cy.get('@form')
      .find('[data-testid="spec.description"]:visible')
      .find('input')
      .clear({ force: true })
      .type(PIZZA_DESC, { force: true });

    cy.get('@form')
      .find('[data-testid="spec.sauce"]:visible')
      .find('input')
      .clear()
      .type(SAUCE);

    cy.get('@form')
      .find('[data-testid="spec.recipeSecret"]:visible')
      .find('input')
      .type(RECIPE, { force: true });

    cy.get('@form').contains('Owner References');

    cy.get('@form')
      .find('[aria-label="Pizza name"]:visible')
      .find('input')
      .clear({ force: true })
      .type(PIZZA_NAME, { force: true });

    cy.checkUnsavedDialog();

    cy.saveChanges('Create');

    cy.getMidColumn()
      .contains('ui5-title', PIZZA_NAME)
      .should('be.visible');
  });
});
