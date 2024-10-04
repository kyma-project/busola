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

    cy.openCreate();

    cy.get('ui5-input[accessible-name="Role name"]:visible', { log: false })
      .find('input')
      .click()
      .type(ROLE_NAME, { force: true });

    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      API_GROUP,
    );

    cy.get('[accessible-name="roles.buttons.load"]:visible', {
      log: false,
    }).click();

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

    cy.saveChanges('Create');
  });

  it('Check the Role details', () => {
    cy.getMidColumn()
      .contains('ui5-title', ROLE_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[aria-label="get"]')
      .should('not.have.text', '-');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[aria-label="create"]')
      .should('not.have.text', '-');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[data-testid=watch]')
      .should('have.text', '-');
  });

  it('Edit the Role', () => {
    cy.wait(1000);

    cy.inspectTab('Edit');

    cy.get(`ui5-combobox[placeholder^="Start typing to select Verbs"]:visible`)
      .find('input')
      .filterWithNoValue()
      .click()
      .type('watch');

    cy.saveChanges('Edit');
  });

  it('Check the Role details after edit', () => {
    cy.inspectTab('View');

    cy.getMidColumn()
      .contains('ui5-title', ROLE_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[aria-label="get"]')
      .should('not.have.text', '-');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[aria-label="create"]')
      .should('not.have.text', '-');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[aria-label="watch"]')
      .should('not.have.text', '-');
  });

  it('Inspect list', () => {
    cy.inspectList(ROLE_NAME);
  });

  it('Clone the Role', () => {
    cy.getLeftNav()
      .contains('Roles')
      .click();

    cy.contains('ui5-table-row', ROLE_NAME)
      .find('ui5-button[data-testid="clone"]')
      .click();

    cy.get('ui5-input[accessible-name="Role name"]:visible', { log: false })
      .find('input')
      .click()
      .type(CLONE_NAME);

    cy.saveChanges('Create');
  });

  it('Check the clone details', () => {
    cy.getMidColumn()
      .contains('ui5-title', CLONE_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[data-testid=create]')
      .should('not.have.text', '-');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[data-testid=watch]')
      .should('not.have.text', '-');

    cy.getMidColumn()
      .contains('ui5-panel', 'Rules')
      .find('[data-testid=list]')
      .should('have.text', '-');
  });
});
