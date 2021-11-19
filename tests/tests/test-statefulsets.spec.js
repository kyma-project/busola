const SET_NAME = 'alertmanager-monitoring-alertmanager';

context('Test StatefulSets', () => {
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

    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Stateful Sets')
      .click();
  });

  it('Inspect list', () => {
    cy.url().should('match', /statefulsets$/);
    cy.getIframeBody().contains(SET_NAME);
  });

  it('Inspect details', () => {
    cy.getIframeBody()
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
