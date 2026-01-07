const NAME = `config-map-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test app settings and preferences', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Deletes without confirmation', () => {
    cy.get('[tooltip="Profile"]').click({ force: true });

    cy.get('ui5-menu-item:visible').contains('Settings').click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('.settings-row', 'Delete without confirmation')
      .find('ui5-switch')
      .find('div[role="switch"')
      .click({ force: true });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.navigateTo('Configuration', 'Config Maps');

    cy.openCreate();

    cy.get('[accessible-name="ConfigMap name"]:visible')
      .find('input')
      .type(NAME, { force: true })
      .click();

    cy.saveChanges('Create');

    cy.contains('ui5-title', NAME).should('be.visible');

    cy.getLeftNav().contains('Config Maps').click();

    cy.contains('ui5-table-row', NAME)
      .find('ui5-button[data-testid="delete"]')
      .click();

    cy.contains('Are you sure you want to delete').should('not.be.visible');

    // disable "deletion without confirmation" to not mess other tests
    cy.get('[tooltip="Profile"]').click({ force: true });

    cy.get('ui5-menu-item:visible').contains('Settings').click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('.settings-row', 'Delete without confirmation')
      .find('ui5-switch')
      .find('div[role="switch"')
      .click({ force: true });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();
  });

  it('Changes application theme', () => {
    cy.get('[tooltip="Profile"]').click({ force: true });

    cy.get('ui5-menu-item:visible').contains('Settings').click({ force: true });

    cy.contains('Appearance').click();

    cy.contains('High-Contrast Black').click();

    cy.get('.vertical-tabs-wrapper').should(
      'have.css',
      'background-color',
      'rgb(0, 0, 0)',
    );

    cy.contains('Light').click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();
  });

  it('Shows hidden namespaces', () => {
    cy.get('[tooltip="Profile"]').click({ force: true });

    cy.get('ui5-menu-item:visible').contains('Settings').click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('.settings-row', 'Show hidden Namespaces')
      .find('[accessible-name="Show hidden Namespaces"]')
      .invoke('attr', 'aria-checked')
      .then((value) => {
        if (value === 'true' || value === 'checked') {
          cy.contains('.settings-row', 'Show hidden Namespaces')
            .find('ui5-switch')
            .find('div[role="switch"')
            .click({ force: true });
        }
      });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.getLeftNav().contains('Back To Cluster Overview').click();

    cy.getLeftNav()
      .find('ui5-side-navigation-item')
      .contains('Namespaces')
      .click();

    cy.get('ui5-table-row')
      .contains(/^kube-system/)
      .should('not.exist');

    cy.goToNamespaceDetails();
  });
});
