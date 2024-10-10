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
      .printAccessibilityTestResults();
  });

  it('Acc test cluster overview', () => {
    cy.loginAndSelectCluster();

    cy.url().should('match', /overview$/);

    cy.runAllAccessibilityTests().printAccessibilityTestResults();
  });

  it('Acc test namespace overview', () => {
    cy.loginAndSelectCluster();

    cy.url().should('match', /overview$/);

    cy.createNamespace('acc-test-namespace');

    cy.runAllAccessibilityTests().printAccessibilityTestResults();
  });

  it('Subbmit accessibility concerns to AMP', () => {
    cy.submitAccessibilityConcernsToAMP('AMP test PR');
  });
});
