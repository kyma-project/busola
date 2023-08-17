/// <reference types="cypress" />

context('Test navigation features', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it("Navigates to Cluster Overview when namespace in url doesn't exist", () => {
    cy.navigateTo('Workloads', 'Deployments');
    cy.url().then(url => {
      const newurl = url.replace(
        Cypress.env('NAMESPACE_NAME'),
        'non-exist-namespace',
      );
      cy.visit(newurl);
    });

    cy.wait(500);
    cy.contains('Incorrect path', { includeShadowDom: true });
    cy.contains('OK', { includeShadowDom: true }).click();
    cy.contains('Cluster Details');
  });
});
