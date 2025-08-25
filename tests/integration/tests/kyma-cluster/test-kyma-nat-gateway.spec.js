/// <reference types="cypress" />
import 'cypress-file-upload';

context('Test Kyma version', () => {
  Cypress.skipAfterFail();

  it('No Kyma Version when feature is disabled', () => {
    cy.loginAndSelectCluster();
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('NAT Gateway IP Addresses').should('be.visible');
  });
});
