/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up Application', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Delete the Application', () => {
    cy.navigateTo('Integration', 'Applications');

    cy.deleteFromGenericList(Cypress.env('APP_NAME'));
  });
});
