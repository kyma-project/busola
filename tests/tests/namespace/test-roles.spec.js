/// <reference types="cypress" />
import 'cypress-file-upload';
import { deleteFromGenericList } from '../../support/helpers';

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

    cy.getIframeBody()
      .contains(ROLE_NAME)
      .should('not.exist');

    cy.getIframeBody()
      .contains('Create Role')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Role name"]:visible', { log: false })
      .type(ROLE_NAME)
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select API Groups from the list"]:visible',
        { log: false },
      )
      .type(API_GROUP)
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select Resources from the list"]:visible',
        { log: false },
      )
      .type(RESOURCE)
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select Verbs from the list"]:visible',
        { log: false },
      )
      .type('get')
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select Verbs from the list"]:visible',
        { log: false },
      )
      .eq(1)
      .type('impersonate')
      .click();

    cy.getIframeBody()
      .contains('button', /^Create$/)
      .click();
  });

  it('Check the Role details', () => {
    cy.getIframeBody()
      .contains('h3', ROLE_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .contains('td', 'impersonate');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .find('[data-testid=watch]')
      .should('have.text', '-');
  });

  it('Edit the Role', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select Verbs from the list"]:visible',
        { log: false },
      )
      .eq(2)
      .type('watch')
      .click();

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();
  });

  it('Check the Role details after edit', () => {
    cy.getIframeBody()
      .contains('h3', ROLE_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .contains('td', 'impersonate');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
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

    cy.getIframeBody()
      .contains('.fd-table__row', ROLE_NAME)
      .find('button[data-testid="clone"]')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Role name"]:visible', { log: false })
      .type(CLONE_NAME)
      .click();

    cy.getIframeBody()
      .contains('button', /^Create$/)
      .click();
  });

  it('Check the clone details', () => {
    cy.getIframeBody()
      .contains('h3', CLONE_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .contains('td', 'impersonate');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .find('[data-testid=get]')
      .should('not.have.text', '-');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .find('[data-testid=watch]')
      .should('not.have.text', '-');

    cy.getIframeBody()
      .find('[data-testid=rules-list]')
      .find('[data-testid=list]')
      .should('have.text', '-');
  });

  it('Delete Role and Clone', () => {
    cy.getIframeBody()
      .contains('a', 'Roles')
      .click();

    deleteFromGenericList(CLONE_NAME);

    cy.getLeftNav()
      .contains('Roles')
      .click();

    deleteFromGenericList(ROLE_NAME);
  });
});
