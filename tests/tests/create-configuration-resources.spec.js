/// <reference types="cypress" />
import 'cypress-file-upload';

const CONFIG_MAP_NAME = 'test-configmap';
const SECRET_NAME = 'test-secret';
const USER_NAME = 'user@kyma.eu';
const ROLE_NAME = 'view (CR)';
const GIT_REPOSITORY_URL = 'https://github.com/test/sample-function.git';
const GIT_REPOSITORY_NAME = 'test-git-repository';

context('Test configuration resources', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Config Map', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
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

  it('Create a Secret', () => {
    cy.getLeftNav()
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

  it('Create a Roles list view', () => {
    cy.getLeftNav()
      .find('[data-testid=roles_roles]')
      .click();

    cy.getIframeBody()
      .contains('h3', 'Roles')
      .should('be.visible');
  });

  it('Create a Role Binding', () => {
    cy.getLeftNav()
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

  it('Create a ClusterRoles list view', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .find('[data-testid=cluster-roles_clusterroles]')
      .click();

    cy.getIframeBody()
      .contains('h3', 'ClusterRoles')
      .should('be.visible');

    cy.getIframeBody()
      .find('tbody tr')
      .its('length')
      .should('be.gte', 1);
  });

  it('Create a ClusterRoleBinding', () => {
    cy.getLeftNav()
      .find('[data-testid=cluster-role-bindings_clusterrolebindings]')
      .click();

    cy.getIframeBody()
      .contains('Create ClusterRoleBinding')
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

    cy.getLeftNav()
      .contains('Configuration')
      .click(); // close navigation tab after yourself
  });

  it('Create a Git Repository', () => {
    cy.getLeftNav()
      .find('[data-testid=gitrepositories_gitrepositories]')
      .click();

    cy.getIframeBody()
      .contains('Connect Repository')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Repository name"]')
      .clear()
      .type(GIT_REPOSITORY_NAME);

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the URL address of your Git repository (Required)"]',
      )
      .clear()
      .type(GIT_REPOSITORY_URL);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Connect')
      .click();

    cy.getIframeBody()
      .find('td', GIT_REPOSITORY_NAME, { timeout: 5000 })
      .should('be.visible');

    cy.getIframeBody()
      .contains(GIT_REPOSITORY_URL)
      .should('be.visible');
  });
});
