const NAME = `config-map-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test app settings and preferences', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Deletes without confirmation', () => {
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Cluster interaction').click();

    cy.contains('.preferences-row', 'Delete without confirmation')
      .find('[aria-label="Switch"]')
      .invoke('attr', 'aria-checked')
      .then(value => {
        if (value === 'false') {
          cy.contains('.preferences-row', 'Delete without confirmation')
            .find('.fd-switch')
            .click();
        }
      });

    cy.contains('Close').click();

    cy.navigateTo('Configuration', 'Config Maps');

    cy.contains('Create Config Map').click();

    cy.get('input[ariaLabel="ConfigMap name"]:visible').type(NAME);

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.contains('[aria-label="title"]', NAME).should('be.visible');

    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.contains('.fd-table__row', NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.contains('Are you sure you want to delete').should('not.be.visible');

    // disable "deletion without confirmation" to not mess other tests
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('.fd-menu', 'Preferences').click();

    cy.contains('Cluster interaction').click();

    cy.contains('.preferences-row', 'Delete without confirmation')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();
  });

  it('Changes application theme', () => {
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('High-Contrast Black').click();

    cy.get('.vertical-tabs-wrapper').should(
      'have.css',
      'background-color',
      'rgb(0, 0, 0)',
    );

    cy.contains('Light / Dark').click();

    cy.contains('Close').click();
  });

  it('Shows hidden namespaces', () => {
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Cluster interaction').click();

    cy.contains('.preferences-row', 'Show hidden Namespaces')
      .find('[aria-label="Show hidden Namespaces"]')
      .invoke('attr', 'aria-checked')
      .then(value => {
        if (value === 'true') {
          cy.contains('.preferences-row', 'Show hidden Namespaces')
            .find('.fd-switch')
            .click();
        }
      });

    cy.contains('Close').click();

    cy.getLeftNav()
      .contains('Back To Cluster Details')
      .click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('a', /^kube-system/).should('not.exist');

    cy.contains(Cypress.env('NAMESPACE_NAME')).click();
  });
});
