/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../../config';

context('Test other login options', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
  });

  it('Reset endpoint', () => {
    cy.loginAndSelectCluster();
    cy.url().should('match', /overview$/);

    cy.visit(`${config.clusterAddress}/reset`);
    cy.url().should('match', /clusters$/);
  });
});
