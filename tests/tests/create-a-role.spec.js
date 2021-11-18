/// <reference types="cypress" />
import 'cypress-file-upload';

const ROLE_NAME = 'test-role';

context('Create a Role', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Role', () => {
    cy.getLeftNav()
      .find('[data-testid=roles_roles]')
      .click();

    cy.getIframeBody()
      .contains(ROLE_NAME)
      .should('not.exist');

    cy.getIframeBody()
      .contains('Create Role')
      .click();
  });
});
