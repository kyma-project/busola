/// <reference types="cypress" />
import config from '../../config';

context('Accessibility test Cluster list and overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
    cy.loginAndSelectCluster();
  });

  it('Acc test with performance panel open', () => {
    cy.openSettingsMenu();

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.expose('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.expose('AMP_REPORT_NAME'),
        'Performance panel',
      );
  });
});
