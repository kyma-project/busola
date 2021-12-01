const NAME = `config-map-${Math.floor(Math.random() * 9999) + 1000}`;

context('Test app settings and preferences', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Deletes without confirmation', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getModalIframeBody()
      .contains('.preferences-row', 'Delete without confirmation')
      .find('[aria-label="Switch"]')
      .invoke('attr', 'aria-checked')
      .then(value => {
        if (value === 'false') {
          cy.getModalIframeBody()
            .contains('.preferences-row', 'Delete without confirmation')
            .find('.fd-switch')
            .click();
        }
      });

    cy.get('[aria-label="close"]').click();

    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('input[placeholder="Config Map Name"]:visible')
      .type(NAME);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

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
    cy.getModalIframeBody()
      .contains('Cluster interaction')
      .click();
    cy.getModalIframeBody()
      .contains('.preferences-row', 'Delete without confirmation')
      .find('.fd-switch')
      .click();
    cy.get('[aria-label="close"]').click();
  });

  it('Changes application theme', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('High-Contrast Black')
      .click();

    cy.getModalIframeBody()
      .find('.vertical-tabs-wrapper')
      .should('have.css', 'background-color', 'rgb(0, 0, 0)');

    cy.getModalIframeBody()
      .contains('Light / Dark')
      .click();

    cy.get('[aria-label="close"]').click();
  });

  it('Shows hidden namespaces', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getModalIframeBody()
      .contains('.preferences-row', 'Show hidden Namespaces')
      .find('[aria-label="Switch"]')
      .invoke('attr', 'aria-checked')
      .then(value => {
        if (value === 'false') {
          cy.getModalIframeBody()
            .contains('.preferences-row', 'Show hidden Namespaces')
            .find('.fd-switch')
            .click();
        }
      });

    cy.get('[aria-label="close"]').click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('a', /^kube-/)
      .first()

      .should('be.visible');

    cy.task('getNamespace').then(ns => {
      cy.getIframeBody()
        .contains(ns)
        .click();
    });
  });
});
