/// <reference types="cypress" />
import 'cypress-file-upload';
import { chooseComboboxOption } from '../../support/helpers';

const ROLE_NAME = `test-role-${Math.floor(Math.random() * 9999) + 1000}`;
const CLONE_NAME = `${ROLE_NAME}-clone`;
const API_GROUP = '(core)';
const RESOURCE = 'namespaces';

context('Test Roles', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Role', () => {
    cy.navigateTo('Configuration', 'Roles');

    cy.contains(ROLE_NAME).should('not.exist');

    cy.contains('ui5-button', 'Create Role').click();

    cy.get('[aria-label="Role name"]:visible', { log: false })
      .find('input')
      .type(ROLE_NAME)
      .click();

    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      API_GROUP,
    );

    cy.get('[ariaLabel="roles.buttons.load"]:visible', { log: false }).click();

    chooseComboboxOption(
      '[placeholder^="Start typing to select Resources"]:visible',
      RESOURCE,
    );

    chooseComboboxOption(
      '[placeholder^="Start typing to select Verbs"]:visible',
      'get',
    );

    chooseComboboxOption(
      '[placeholder^="Start typing to select Verbs"]:visible',
      'create',
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Check the Role details', () => {
    cy.contains('ui5-title', ROLE_NAME).should('be.visible');

    cy.contains('ui5-panel', 'Rules')
      .find('[aria-label="get"]')
      .should('not.have.text', '-');

    cy.contains('ui5-panel', 'Rules')
      .find('[aria-label="create"]')
      .should('not.have.text', '-');

    cy.contains('ui5-panel', 'Rules')
      .find('[data-testid=watch]')
      .should('have.text', '-');
  });

  it('Edit the Role', () => {
    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    chooseComboboxOption(
      '[placeholder^="Start typing to select Verbs"]:visible',
      'watch',
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();
  });

  it('Check the Role details after edit', () => {
    cy.contains('ui5-title', ROLE_NAME).should('be.visible');

    cy.contains('ui5-panel', 'Rules')
      .find('[aria-label="get"]')
      .should('not.have.text', '-');

    cy.contains('ui5-panel', 'Rules')
      .find('[aria-label="create"]')
      .should('not.have.text', '-');

    cy.contains('ui5-panel', 'Rules')
      .find('[aria-label="watch"]')
      .should('not.have.text', '-');
  });

  it('Inspect list', () => {
    cy.inspectList('Roles', ROLE_NAME);
  });

  it('Clone the Role', () => {
    cy.getLeftNav()
      .contains('Roles')
      .click();

    cy.contains('ui5-table-row', ROLE_NAME)
      .find('ui5-button[data-testid="clone"]')
      .click();

    cy.get('[aria-label="Role name"]:visible', { log: false })
      .find('input')
      .type(CLONE_NAME)
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Check the clone details', () => {
    cy.contains('ui5-title', CLONE_NAME).should('be.visible');

    cy.contains('ui5-panel', 'Rules')
      .find('[data-testid=create]')
      .should('not.have.text', '-');

    cy.contains('ui5-panel', 'Rules')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.contains('ui5-panel', 'Rules')
      .find('[data-testid=watch]')
      .should('not.have.text', '-');

    cy.contains('ui5-panel', 'Rules')
      .find('[data-testid=list]')
      .should('have.text', '-');
  });
});
