import config from '../config';

context('Test Cluster Switching', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Add second cluster', () => {
    cy.get('[data-testid=app-switcher]').click();

    cy.get('[data-testid=clusters-overview]').click();

    cy.visit(`${config.clusterAddress}/clusters`)
      .getIframeBody()
      .contains('Add a Cluster')
      .click();

    cy.getIframeBody()
      .contains('Drag file here')
      .attachFile('kubeconfig-2.yaml', { subjectType: 'drag-n-drop' });

    cy.getIframeBody()
      .contains('Next')
      .click();

    cy.getIframeBody()
      .contains('Add Cluster')
      .click();

    cy.url().should('match', /namespaces$/);

    cy.getIframeBody()
      .find('thead')
      .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.
  });

  it('Switch cluster', () => {
    cy.get('[data-testid=app-switcher]').click();

    cy.get('ul li')
      .first()
      .click();

    cy.url().should('match', /namespaces$/);

    cy.getIframeBody()
      .find('thead')
      .should('be.visible');
  });

  it('Delete cluster', () => {
    cy.get('[data-testid=app-switcher]').click();
    cy.get('[data-testid=clusters-overview]').click();
    cy.getIframeBody()
      .find('[data-testid="delete"]')
      .first()
      .click();
  });
});
