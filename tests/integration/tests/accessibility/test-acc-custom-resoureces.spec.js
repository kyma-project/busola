/// <reference types="cypress" />

import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-customresourcedefinisions-cluster.yaml';
const TCLUSTER_FILE_NAME = 'test-Tcluster.yaml';

context('Accessibility test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setUpContinuum('continuum/continuum.conf.js');

    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Custom Resource Definitions');

    cy.openCreate();

    cy.wrap(loadFile(FILE_NAME)).then((CRD_CONFIG) => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.checkUnsavedDialog();

    cy.saveChanges('Create');
  });

  it('Acc test Custom Resources overview', () => {
    cy.getLeftNav().contains('Custom Resources').click();

    cy.contains('ui5-title', 'Custom Resources').should('be.visible');

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Custom Resources overview',
      );
  });

  it('Acc test single Custom Resource list', () => {
    cy.get('ui5-table-row').contains('Tclusters').click();

    cy.contains('ui5-title', 'Tclusters').should('be.visible');

    cy.contains('ui5-button', /Create/i).should('be.visible');

    cy.url().should('match', /customresources/);

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Custom Resources single list',
      );
  });

  it('Acc test Tcluster Custom Resource details', () => {
    cy.getLeftNav().contains('Custom Resources').click();

    cy.get('ui5-input[id^=search-]:visible')
      .find('input')
      .wait(1000)
      .type('cypress');
    cy.clickGenericListLink('Tclusters');

    cy.contains('ui5-button', 'Create').click();

    cy.wrap(loadFile(TCLUSTER_FILE_NAME)).then((TC_CONFIG) => {
      const TC = JSON.stringify(TC_CONFIG);
      cy.pasteToMonaco(TC);
    });

    cy.checkUnsavedDialog();

    cy.saveChanges('Create');

    cy.contains('ui5-title', 'tcluster-test').should('be.visible');

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Tcluster Custom Resource details',
      );
  });
});
