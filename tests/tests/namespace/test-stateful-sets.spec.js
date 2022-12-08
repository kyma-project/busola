const SET_NAME = 'alertmanager-monitoring-alertmanager';

context('Test Stateful Sets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();

    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Cluster interaction').click();

    cy.contains('.preferences-row', 'Show hidden Namespaces')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.contains('a', 'kyma-system').click();

    cy.navigateTo('Workloads', 'Stateful Sets');
  });

  it('Create and inspect list', () => {
    cy.url().should('match', /statefulsets$/);

    cy.contains(SET_NAME);
  });

  it('Inspect details', () => {
    cy.get('[role="search"] [aria-label="open-search"]').type(SET_NAME);

    cy.get('table.fd-table')
      .contains(SET_NAME)
      .click();

    cy.url().should('match', new RegExp(`statefulsets/${SET_NAME}$`));

    // name
    cy.contains(SET_NAME);
    // controlled by
    cy.contains('Alertmanager');
    // pod
    cy.contains('alertmanager-monitoring-alertmanager-0');
  });
});
