const NAME = `config-map-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test app settings and preferences', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Deletes without confirmation', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getIframeBody()
      .contains('.preferences-row', 'Delete without confirmation')
      .find('[aria-label="Switch"]')
      .invoke('attr', 'aria-checked')
      .then(value => {
        if (value === 'false') {
          cy.getIframeBody()
            .contains('.preferences-row', 'Delete without confirmation')
            .find('.fd-switch')
            .click();
        }
      });

    cy.get('[aria-label="close"]').click();

    cy.navigateTo('Configuration', 'Config Maps');

    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('input[ariaLabel="ConfigMap name"]:visible')
      .type(NAME);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', NAME)
      .should('be.visible');

    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('Are you sure you want to delete')
      .should('not.exist');

    // disable "deletion without confirmation" to not mess other tests
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
    cy.contains('Preferences').click();

    cy.getIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getIframeBody()
      .contains('.preferences-row', 'Delete without confirmation')
      .find('.fd-switch')
      .click();

    cy.get('[aria-label="close"]').click();
  });

  it('Changes application theme', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getIframeBody()
      .contains('High-Contrast Black')
      .click();

    cy.getIframeBody()
      .find('.vertical-tabs-wrapper')
      .should('have.css', 'background-color', 'rgb(0, 0, 0)');

    cy.getIframeBody()
      .contains('Light / Dark')
      .click();

    cy.get('[aria-label="close"]').click();
  });

  it('Shows hidden namespaces', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getIframeBody()
      .contains('.preferences-row', 'Show hidden Namespaces')
      .find('[aria-label="Switch"]')
      .invoke('attr', 'aria-checked')
      .then(value => {
        if (value === 'false') {
          cy.getIframeBody()
            .contains('.preferences-row', 'Show hidden Namespaces')
            .find('.fd-switch')
            .click();
        }
      });
    cy.get('[aria-label="close"]').click();

    cy.getLeftNav()
      .contains('Back to Cluster Details')
      .click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('a', /^kube-/)
      .first()

      .should('be.visible');

    cy.getIframeBody()
      .contains(Cypress.env('NAMESPACE_NAME'))
      .click();
  });
});
