/// <reference types="cypress" />
context('Test navigation features', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaInstallationFeature('HIDDEN_NAMESPACES', false);
    cy.loginAndSelectCluster();
  });

  it('Disable features visible by default', () => {
    // visual resources
    cy.navigateTo('Configuration', 'Cluster Role Bindings');

    cy.wait(500).typeInSearch('cronjob-controller');

    cy.get('ui5-suggestion-item')
      .contains('li', /cronjob-controller/)
      .click();

    cy.wait(1000);

    cy.contains('ui5-text', 'system:controller:cronjob-controller').click();

    cy.getMidColumn()
      .contains('ui5-panel', 'Subjects')
      .contains('ui5-link', 'cronjob-controller')
      .click();

    cy.contains('Disabled').should('exist');
  });
});
