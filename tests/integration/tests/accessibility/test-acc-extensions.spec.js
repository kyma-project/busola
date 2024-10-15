/// <reference types="cypress" />

context('Accessibility test Extensions view', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
    cy.setUpContinuum('continuum/continuum.conf.js');
    cy.loginAndSelectCluster();
  });

  it('Acc test Extensions list', () => {
    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles(
      'examples/pizzas/configuration/pizzas-configmap.yaml',
      'examples/pizzas/configuration/pizza-orders-configmap.yaml',
      'examples/pizzas/configuration/pizzas-crd.yaml',
      'examples/pizzas/configuration/pizza-orders-crd.yaml',
    ).then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.getLeftNav()
      .contains('Extensions')
      .click();

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(Cypress.env('AMP_REPORT_NAME'));
  });

  it('Acc test Extensions create', () => {
    cy.contains('ui5-button', 'Create').click();

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(Cypress.env('AMP_REPORT_NAME'));
  });

  it('Acc test Extensions details', () => {
    cy.getLeftNav()
      .contains('Extensions')
      .click();

    cy.clickGenericListLink('pizzas');

    cy.runAllAccessibilityTests()
      .printAccessibilityTestResults()
      .submitAccessibilityConcernsToAMP(Cypress.env('AMP_REPORT_NAME'));
  });
});
