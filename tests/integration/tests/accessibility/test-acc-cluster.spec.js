/// <reference types="cypress" />
import config from '../../config';

context('Accessibility test Cluster list and overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
  });

  it('Acc test clusters list', () => {
    alert(Cypress.env('IS_PR'));
    cy.visit(`${config.clusterAddress}/clusters`)
      .runAllAccessibilityTests()
      .printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === true) cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Clusters list',
      );
  });

  it('Acc test cluster overview', () => {
    cy.loginAndSelectCluster();

    cy.url().should('match', /overview$/);

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === true) cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Cluster overview',
      );
  });
});
