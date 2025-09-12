/// <reference types="cypress" />

import jsyaml from 'js-yaml';

context('Accessibility test Extensions view', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
    cy.loginAndSelectCluster();

    cy.wait(1000);

    cy.createNamespace('pizzas');

    cy.getLeftNav().contains('Cluster Details').click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles(
      'examples/pizzas/configuration/pizzas-configmap.yaml',
      'examples/pizzas/configuration/pizzas-crd.yaml',
    ).then((resources) => {
      const input = resources.map((r) => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 2);
  });

  it('Acc test Extensions list', () => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Extensions');

    cy.wait(500);

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Extensions list',
      );
  });

  it('Acc test Extensions create', () => {
    cy.openCreate();

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Extensions create',
      );
  });

  it('Acc test Extensions details', () => {
    cy.getLeftNav().contains('Extensions').click();

    cy.get('ui5-input[id="search-input"]:visible')
      .find('input')
      .wait(1000)
      .type('pizzas');

    cy.clickGenericListLink('pizzas');

    cy.runAllAccessibilityTests().printAccessibilityTestResults();

    if (Cypress.env('IS_PR') === 'true')
      cy.log('Skipping AMP submission for PR');
    else
      cy.submitAccessibilityConcernsToAMP(
        Cypress.env('AMP_REPORT_NAME'),
        'Extensions details',
      );
  });

  it('Clean up', () => {
    cy.getLeftNav()
      .find('ui5-side-navigation-item')
      .contains('Namespaces')
      .click();

    cy.deleteFromGenericList('Namespace', 'pizzas', {
      clearSearch: false,
      checkIfResourceIsRemoved: false,
      selectSearchResult: true,
      searchInPlainTableText: true,
    });

    cy.get('ui5-table-row').find('.status-badge').contains('Terminating');
  });
});
