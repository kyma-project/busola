context('Test resource validation', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.fixture('examples/resource-validation/rule-set.yaml').then(ruleSet => {
      cy.mockConfigMap({
        label: 'busola.io/resource-validation=rule-set',
        data: ruleSet,
      });

      cy.goToNamespaceDetails();
    });
  });

  it('Disables resource validation via preferences', () => {
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Clusters').click();

    cy.contains('Resource Validation').click();

    cy.contains('.fd-layout-panel__header', 'Validate Resources')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();

    cy.contains('Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });
    cy.contains('nginx:1.14.2').should('be.visible');
    cy.contains('warnings').should('not.exist');

    cy.contains('.validate-resources', 'Validate resources')
      .find('.fd-switch')
      .click();

    cy.contains('Cancel').click();
  });

  it('Enables choosing resource validation policies', () => {
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Clusters').click();

    cy.contains('Resource Validation').click();

    cy.contains('Customize').click();

    cy.contains('.policy-row', 'Default')
      .find('.fd-switch')
      .click();
    cy.contains('.policy-row', 'PodSecurityStandardsBaseline')
      .find('.fd-switch')
      .click();
    cy.contains('.policy-row', 'TestPolicy')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();

    cy.contains('Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });
    cy.contains('nginx:1.14.2').should('be.visible');
    cy.contains('Show warnings')
      .should('be.visible')
      .click();

    cy.contains(
      'refrain from using insecure capabilities to prevent access to sensitive components',
    ).should('be.visible');
    cy.contains('This is a test rule').should('be.visible');

    cy.contains('Cancel').click();

    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Clusters').click();

    cy.contains('Resource Validation').click();

    cy.contains('Reset').click();

    cy.contains('Close').click();
  });
});
