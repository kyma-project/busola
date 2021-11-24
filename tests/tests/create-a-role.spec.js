/// <reference types="cypress" />
import 'cypress-file-upload';

const ROLE_NAME = 'test-role';
const API_GROUP = '(core)';
const RESOURCE = 'namespaces';

context('Create a Role', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Role', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .find('[data-testid=roles_roles]')
      .click();

    cy.getIframeBody()
      .contains(ROLE_NAME)
      .should('not.exist');

    cy.getIframeBody()
      .contains('Create Role')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Role Name"]')
      .filter(':visible', { log: false })
      .type(ROLE_NAME)
      .click();

    cy.getIframeBody()
      .find('[placeholder="Start typing to select API Groups from the list."]')
      .filter(':visible', { log: false })
      .type(API_GROUP)
      .click();

    cy.getIframeBody()
      .find('[placeholder="Start typing to select Resources from the list."]')
      .filter(':visible', { log: false })
      .type(RESOURCE)
      .click();

    cy.getIframeBody()
      .find('[placeholder="Start typing to select Verbs from the list."]')
      .filter(':visible', { log: false })
      .type('get')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Start typing to select Verbs from the list."]')
      .filter(':visible', { log: false })
      .eq(1)
      .type('impersonate')
      .click();

    cy.getIframeBody()
      .contains('button', /^Create$/)
      .click();
  });

  it('Check the Role details', () => {
    cy.getIframeBody()
      .contains('h3', ROLE_NAME, { timeout: 7000 })
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
      .find('[placeholder="Start typing to select Verbs from the list."]')
      .filter(':visible', { log: false })
      .eq(2)
      .type('watch')
      .click();

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();
  });

  it('Check the Role details after edit', () => {
    cy.getIframeBody()
      .contains('h3', ROLE_NAME, { timeout: 7000 })
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
});
