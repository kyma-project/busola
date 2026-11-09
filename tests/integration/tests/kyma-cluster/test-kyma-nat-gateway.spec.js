/// <reference types="cypress" />
import 'cypress-file-upload';

context('Test NAT Gateway IP Addresses display', () => {
  Cypress.skipAfterFail();

  it('Shows NAT Gateway IP Addresses in cluster overview', () => {
    cy.loginAndSelectCluster();
    cy.goToClusterOverview();

    cy.contains('NAT Gateway IP Addresses').should('be.visible');
  });
});
