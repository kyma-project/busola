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
    cy.contains('ui5-button', 'Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });

    cy.contains('nginx:latest').should('be.visible');

    cy.get('[class="yaml-upload-modal__info"]').get('ui5-icon[name="alert"]');

    cy.get('[class="yaml-upload-modal__info"]')
      .get('button[title="Expand/Collapse"]')
      .click();

    cy.contains(
      'specify an image version to avoid unpleasant "version surprises" in the future',
    ).should('be.visible');

    cy.get('[data-testid=yaml-cancel]').click();
  });

  it('Disables resource validation via preferences', () => {
    cy.get('[title="Profile"]').click();

    cy.get('ui5-li:visible')
      .contains('Preferences')
      .click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('Resource Validation')
      .parentsUntil('[role=tab]')
      .click({ force: true });

    cy.contains('ui5-panel', 'Validate Resources')
      .find('ui5-switch')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });

    cy.contains('nginx:latest').should('be.visible');

    cy.contains('warnings').should('not.exist');

    cy.contains('.validate-resources', 'Validate resources')
      .find('ui5-switch')
      .click();

    cy.get('[data-testid=yaml-cancel]').click();
  });

  it('Customize resource validation policies via preferences', () => {
    cy.get('[title="Profile"]').click();

    cy.get('ui5-li:visible')
      .contains('Preferences')
      .click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('Resource Validation')
      .parentsUntil('[role=tab]')
      .click({ force: true });

    cy.contains('ui5-button', 'Customize').click();

    cy.contains('.policy-row', 'Default')
      .find('ui5-switch')
      .click();

    cy.contains('.policy-row', 'PodSecurityStandardsBaseline')
      .find('ui5-switch')
      .click();

    cy.contains('.policy-row', 'TestPolicy')
      .find('ui5-switch')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });

    cy.contains('nginx:latest').should('be.visible');

    cy.get('[class="yaml-upload-modal__info"]').get('ui5-icon[name="alert"]');

    cy.get('[class="yaml-upload-modal__info"]')
      .get('button[title="Expand/Collapse"]')
      .click();

    cy.contains(
      'refrain from using insecure capabilities to prevent access to sensitive components',
    ).should('be.visible');

    cy.contains('This is a test rule').should('be.visible');

    cy.get('[data-testid=yaml-cancel]').click();

    cy.get('[title="Profile"]').click();

    cy.get('ui5-li:visible')
      .contains('Preferences')
      .click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('Resource Validation')
      .parentsUntil('[role=tab]')
      .click({ force: true });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Reset')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();
  });

  it('Customize resource validation policies via feature flag', () => {
    cy.setBusolaFeature('RESOURCE_VALIDATION', true, {
      config: {
        policies: ['Default', 'PodSecurityStandardsRestricted'],
      },
    });

    cy.loginAndSelectCluster();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.fixture('examples/resource-validation/pod.yaml').then(podConfig => {
      cy.pasteToMonaco(podConfig);
    });

    cy.contains('nginx:latest').should('be.visible');

    cy.get('[class="yaml-upload-modal__info"]')
      .get('ui5-icon[name="alert"]')
      .should('be.visible');

    cy.get('[class="yaml-upload-modal__info"]')
      .get('button[title="Expand/Collapse"]')
      .click();

    cy.get('[class="yaml-upload-modal__info"]').contains(
      'Incorrect or missing values for `capabilities.drop`',
    );

    cy.get('[class="yaml-upload-modal__info"]').contains('must contain ALL');

    cy.get('[data-testid=yaml-cancel]').click();
  });
});
