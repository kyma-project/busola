const NAME = `config-map-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test app settings and preferences', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Deletes without confirmation', () => {
    cy.get('[title="Profile"]').click();

    cy.get('ui5-li:visible')
      .contains('Preferences')
      .invoke('show')
      .click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('.preferences-row', 'Delete without confirmation')
      .find('ui5-switch')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.navigateTo('Configuration', 'Config Maps');

    cy.contains('ui5-button', 'Create Config Map').click();

    cy.get('[aria-label="ConfigMap name"]:visible')
      .find('input')
      .type(NAME, { force: true })
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();

    cy.contains('ui5-title', NAME).should('be.visible');

    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.contains('ui5-table-row', NAME)
      .find('ui5-button[data-testid="delete"]')
      .click();

    cy.contains('Are you sure you want to delete').should('not.be.visible');

    // disable "deletion without confirmation" to not mess other tests
    cy.get('[title="Profile"]').click();

    cy.get('ui5-li:visible')
      .contains('Preferences')
      .invoke('show')
      .click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('.preferences-row', 'Delete without confirmation')
      .find('ui5-switch')
      .click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();
  });

  it('Changes application theme', () => {
    cy.get('[title="Profile"]').click();

    cy.get('ui5-li:visible')
      .contains('Preferences')
      .invoke('show')
      .click({ force: true });

    cy.contains('Interface').click();

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
    cy.get('[title="Profile"]').click();

    cy.get('ui5-li:visible')
      .contains('Preferences')
      .invoke('show')
      .click({ force: true });

    cy.contains('Cluster interaction').click();

    cy.contains('.preferences-row', 'Show hidden Namespaces')
      .find('[aria-label="Show hidden Namespaces"]')
      .invoke('attr', 'aria-checked')
      .then(value => {
        if (value === 'true') {
          cy.contains('.preferences-row', 'Show hidden Namespaces')
            .find('ui5-switch')
            .click();
        }
      });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.getLeftNav()
      .contains('Back To Cluster Details')
      .click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('a', /^kube-system/).should('not.exist');

    cy.goToNamespaceDetails();
  });
});
