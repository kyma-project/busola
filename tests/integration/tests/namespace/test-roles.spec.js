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
    cy.wait(500); // TODO - check why Configuration is detached from DOM
    cy.navigateTo('Configuration', 'Roles');

    cy.contains(ROLE_NAME).should('not.exist');

    cy.contains('Create Role').click();

    cy.get('[ariaLabel="Role name"]:visible', { log: false })
      .type(ROLE_NAME)
      .click();

    chooseComboboxOption(
      '[placeholder^="Start typing to select API"]:visible',
      API_GROUP,
    );

    cy.get('[ariaLabel="Load"]:visible', { log: false }).click();

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

    cy.contains('button', /^Create$/).click();
  });

  it('Check the Role details', () => {
    cy.contains('h3', ROLE_NAME).should('be.visible');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=create]')
      .should('not.have.text', '-');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=watch]')
      .should('have.text', '-');
  });

  it('Edit the Role', () => {
    cy.contains('Edit').click();

    chooseComboboxOption(
      '[placeholder^="Start typing to select Verbs"]:visible',
      'watch',
    );

    cy.contains('button', 'Update').click();
  });

  it('Check the Role details after edit', () => {
    cy.contains('h3', ROLE_NAME).should('be.visible');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=create]')
      .should('not.have.text', '-');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=watch]')
      .should('not.have.text', '-');
  });

  it('Inspect list', () => {
    cy.inspectList('Roles', ROLE_NAME);
  });

  it('Clone the Role', () => {
    cy.getLeftNav()
      .contains('Roles')
      .click();

    cy.contains('.fd-table__row', ROLE_NAME)
      .find('button[data-testid="clone"]')
      .click();

    cy.get('[ariaLabel="Role name"]:visible', { log: false })
      .type(CLONE_NAME)
      .click();

    cy.contains('button', /^Create$/).click();
  });

  it('Check the clone details', () => {
    cy.contains('h3', CLONE_NAME).should('be.visible');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=create]')
      .should('not.have.text', '-');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=watch]')
      .should('not.have.text', '-');

    cy.get('[data-testid=rules-list]')
      .find('[data-testid=list]')
      .should('have.text', '-');
  });
});
