const SET_NAME = 'alertmanager-monitoring-alertmanager';

context('Test Stateful Sets', () => {
  Cypress.skipAfterFail();

  // Luigi throws error of the "replace" function when entering the Preferences dialog. Remove the code below after Luigi's removal
  Cypress.on('uncaught:exception', () => {
    return false;
  });

  before(() => {
    cy.loginAndSelectCluster();

    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();
    cy.contains('Preferences').click();

    cy.getIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getIframeBody()
      .contains('.preferences-row', 'Show hidden Namespaces')
      .find('.fd-switch')
      .click();

    cy.getIframeBody()
      .contains('Close')
      .click();

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
