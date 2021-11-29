context('Test Protected Resources', () => {
  before(() => {
    cy.loginAndSelectCluster();

    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getModalIframeBody()
      .contains('.preferences-row', 'Show hidden Namespaces')
      .find('.fd-switch')
      .click();

    cy.get('[aria-label="close"]').click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('a', 'kyma-system')
      .click();
  });

  it('Protect a resource', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Deployments')
      .click();

    cy.getIframeBody()
      .contains('tr', 'api-gateway')
      .find('[aria-label="Delete"]')
      .should('be.disabled')
      .click({ force: true });

    cy.getIframeBody()
      .contains('Delete api-gateway')
      .should('not.exist');
  });

  it('Change protection setting', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getModalIframeBody()
      .contains('.preferences-row', 'Do not protect resources')
      .find('.fd-switch')
      .click();

    cy.get('[aria-label="close"]').click();
  });

  it("Don't protect a resource", () => {
    cy.getIframeBody()
      .contains('tr', 'api-gateway')
      .find('[aria-label="Delete"]')
      .click();

    cy.getIframeBody()
      .contains('Delete api-gateway')
      .should('exist');

    cy.getIframeBody()
      .contains('button', 'Cancel')
      .click();
  });
});
