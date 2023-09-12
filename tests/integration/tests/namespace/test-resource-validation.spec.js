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

  it('Check for default policies', () => {
    cy.contains('Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });

    cy.contains('nginx:latest').should('be.visible');

    cy.contains('Show warnings')
      .should('be.visible')
      .click();

    cy.contains(
      'specify an image version to avoid unpleasant "version surprises" in the future',
    ).should('be.visible');

    cy.get('[data-testid=yaml-cancel]').click();
  });

  it('Disables resource validation via preferences', () => {
    cy.get('[title="Profile"]').click();

    cy.contains('Cluster interaction').click();

    cy.contains('Resource Validation')
      .parentsUntil('[role=tab]')
      .click({ force: true });

    cy.contains('.fd-layout-panel__header', 'Validate Resources')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();

    cy.contains('Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });

    cy.contains('nginx:latest').should('be.visible');

    cy.contains('warnings').should('not.exist');

    cy.contains('.validate-resources', 'Validate resources')
      .find('.fd-switch')
      .click();

    cy.get('[data-testid=yaml-cancel]').click();
  });

  it('Customize resource validation policies via preferences', () => {
    cy.get('[title="Profile"]').click();

    cy.contains('Cluster interaction').click();

    cy.contains('Resource Validation')
      .parentsUntil('[role=tab]')
      .click({ force: true });

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

    cy.contains('nginx:latest').should('be.visible');

    cy.contains('Show warnings')
      .should('be.visible')
      .click();

    cy.contains(
      'refrain from using insecure capabilities to prevent access to sensitive components',
    ).should('be.visible');

    cy.contains('This is a test rule').should('be.visible');

    cy.get('[data-testid=yaml-cancel]').click();

    cy.get('[title="Profile"]').click();

    cy.contains('Cluster interaction').click();

    cy.contains('Resource Validation')
      .parentsUntil('[role=tab]')
      .click({ force: true });

    cy.contains('Reset').click();

    cy.contains('Close').click();
  });

  it('Customize resource validation policies via feature flag', () => {
    cy.setBusolaFeature('RESOURCE_VALIDATION', true, {
      config: {
        policies: ['Default', 'PodSecurityStandardsRestricted'],
      },
    });

    cy.loginAndSelectCluster();

    cy.contains('Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });

    cy.contains('nginx:latest').should('be.visible');

    cy.contains('Show warnings')
      .should('be.visible')
      .click();

    cy.get('ui5-message-strip[design="Warning"]').contains(
      'Incorrect or missing values for `capabilities.drop` - must contain ALL',
    );

    cy.get('[data-testid=yaml-cancel]').click();
  });
});
