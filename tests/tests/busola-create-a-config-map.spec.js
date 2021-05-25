/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const NAMESPACE_NAME = config.namespace;
const CONFIG_MAP_NAME = 'test-configmap';
const SECRET_NAME = 'test-secret';
const USER_NAME = 'user@kyma.eu';
const ROLE_NAME = 'view (CR)';
const CLIENT_NAME = 'test-oauth-client';

context('Busola - Testing Configuration', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');
  it('Test a Config Map', () => {
    getLeftNav()
      .contains('Configuration')
      .click();

    getLeftNav()
      .find('[data-testid=config-maps_configmaps]')
      .click();

    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Config Map name"]')
      .clear()
      .type(CONFIG_MAP_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`app=${CONFIG_MAP_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('a', CONFIG_MAP_NAME)
      .click({ force: true });

    cy.getIframeBody()
      .contains(CONFIG_MAP_NAME)
      .should('be.visible');
  });

  it('Test a Secret', () => {
    getLeftNav()
      .find('[data-testid=secrets_secrets]')
      .click();

    cy.getIframeBody()
      .contains('Create Secret')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Secret name"]')
      .clear()
      .type(SECRET_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`app=${SECRET_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('a', SECRET_NAME)
      .click({ force: true });

    cy.getIframeBody()
      .contains(SECRET_NAME)
      .should('be.visible');
  });

  it('Test a Roles list view', () => {
    getLeftNav()
      .find('[data-testid=roles_roles]')
      .click();

    cy.getIframeBody()
      .contains('h3', 'Roles')
      .should('be.visible');
  });

  it('Test a Role Binding', () => {
    getLeftNav()
      .find('[data-testid=role-bindings_rolebindings]')
      .click();

    cy.getIframeBody()
      .contains('Create Role Binding')
      .click();

    cy.getIframeBody()
      .find('[placeholder="User name"]')
      .clear()
      .type(USER_NAME);

    cy.getIframeBody()
      .find('[placeholder="Choose role..."]')
      .type(ROLE_NAME);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('a', `${USER_NAME}-view`)
      .click({ force: true });

    cy.getIframeBody()
      .contains(`${USER_NAME}-view`)
      .should('be.visible');
  });

  it('Test a Cluster Roles list view', () => {
    getLeftNav()
      .contains('Namespaces')
      .click();

    getLeftNav()
      .contains('Administration')
      .click();

    getLeftNav()
      .find('[data-testid=cluster-roles_clusterroles]')
      .click();
    // .wait(1000);

    cy.getIframeBody()
      .contains('h3', 'Cluster Roles')
      .should('be.visible');

    cy.getIframeBody()
      .find('tbody tr')
      .its('length')
      .should('be.gte', 1);
  });

  it('Test a Cluster Role Binding', () => {
    getLeftNav()
      .find('[data-testid=cluster-role-bindings_clusterrolebindings]')
      .click();

    cy.getIframeBody()
      .contains('Create Cluster Role Binding')
      .click();

    cy.getIframeBody()
      .find('[placeholder="User name"]')
      .clear()
      .type(USER_NAME);

    cy.getIframeBody()
      .find('[placeholder="Choose role..."]')
      .type(ROLE_NAME);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(`${USER_NAME}-view`, { force: true }); // use force to skip clicking (the table could re-render between the click and the typing)

    cy.getIframeBody()
      .contains('tbody tr td a', `${USER_NAME}-view`)
      .click({ force: true });

    cy.getIframeBody()
      .contains(`${USER_NAME}-view`)
      .should('be.visible');

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.get('[data-testid=luigi-modal-confirm]').click();

    getLeftNav()
      .contains('Administration')
      .click(); // close navigation tab after yourself
  });

  it('Test a OAuth Clients', () => {
    cy.get('[data-testid=luigi-topnav-logo]').click();

    cy.getIframeBody()
      .contains('a', NAMESPACE_NAME)
      .click({ force: true });

    getLeftNav()
      .find('[data-testid=oauth2clients_oauthclients]')
      .click();

    cy.getIframeBody()
      .contains('Create OAuth2 Client')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Client name"]')
      .clear()
      .type(CLIENT_NAME);

    cy.getIframeBody()
      .contains('label', 'ID token')
      .prev('input')
      .click({ force: true });

    cy.getIframeBody()
      .contains('label', 'Client credentials')
      .prev('input')
      .click({ force: true });

    cy.getIframeBody()
      .find('[placeholder="Enter multiple values separated by comma"]')
      .clear()
      .type(CLIENT_NAME);

    cy.getIframeBody()
      .contains('label', 'Scopes')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('a', CLIENT_NAME)
      .click({ force: true });

    cy.getIframeBody()
      .contains(CLIENT_NAME)
      .should('be.visible');
  });
});
