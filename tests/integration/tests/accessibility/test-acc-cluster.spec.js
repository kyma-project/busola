/// <reference types="cypress" />
import config from '../../config';

context('Accessibility test Cluster list and overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
  });

  it('Acc test clusters list', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(Cypress.env('AMP_REPORT_NAME'));
  });

  it('Acc test cluster overview', () => {
    cy.loginAndSelectCluster();

    cy.url().should('match', /overview$/);

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(Cypress.env('AMP_REPORT_NAME'));
  });
});
