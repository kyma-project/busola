/// <reference types="cypress" />

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check CR groups list', () => {
    cy.navigateTo('Configuration', 'Custom Resources');

    cy.getIframeBody()
      .contains('h3', 'Custom Resources')
      .should('be.visible');

    cy.getIframeBody()
      .find('[type=search]')
      .type('addons');

    cy.getIframeBody()
      .find('table')
      .should('have.length', 1);

    cy.getIframeBody()
      .contains('ClusterAddonsConfigurations')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.getIframeBody()
      .contains('ClusterAddonsConfigurations')
      .click();

    cy.getIframeBody()
      .contains('ClusterAddonsConfigurations')
      .should('be.visible');

    cy.getIframeBody()
      .contains(/Create Clusteraddonsconfiguration/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains('clusteraddonsconfigurations.addons.kyma-project.io')
      .click();

    cy.url().should('match', /customresourcedefinitions/);
  });
});
