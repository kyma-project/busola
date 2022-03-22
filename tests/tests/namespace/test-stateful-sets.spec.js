const SET_NAME = 'alertmanager-monitoring-alertmanager';

context('Test Stateful Sets', () => {
  Cypress.skipAfterFail();

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

    cy.navigateTo('Workloads', 'Stateful Sets');
  });

  it('Create and inspect list', () => {
    cy.url().should('match', /statefulsets$/);
    cy.getIframeBody().contains(SET_NAME);
  });

  it('Inspect details', () => {
    cy.getIframeBody()
      .find('[role="search"] [aria-label="open-search"]')
      .type(SET_NAME);

    cy.getIframeBody()
      .find('table.fd-table')
      .contains(SET_NAME)
      .click();

    cy.url().should('match', new RegExp(`statefulsets/details/${SET_NAME}$`));

    // name
    cy.getIframeBody().contains(SET_NAME);
    // controlled by
    cy.getIframeBody().contains('Alertmanager');
    // pod
    cy.getIframeBody().contains('alertmanager-monitoring-alertmanager-0');
  });
});
