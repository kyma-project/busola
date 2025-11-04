/// <reference types="cypress" />
import 'cypress-file-upload';

context('Test Links from Statics - sap-logging example', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Cluster Overview details', () => {
    cy.wait(500);
    cy.getLeftNav().contains('SAP Cloud Logging').click();

    cy.get('ui5-side-navigation-sub-item')
      .contains('Discover Logs')
      .invoke('attr', 'href')
      .should('match', /^https:\/\/test\/app/);
  });
});
