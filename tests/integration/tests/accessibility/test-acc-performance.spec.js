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
    cy.get('[tooltip="Profile"]').click({ force: true });

    cy.get('ui5-menu-item:visible').contains('Settings').click({ force: true });

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Performance panel',
      );
  });
});
