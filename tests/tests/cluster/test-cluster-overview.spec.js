/// <reference types="cypress" />
import 'cypress-file-upload';

context('Test Cluster Overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Cluster Overview details', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.wait(500);

    cy.getIframeBody()
      .contains('h3', 'Cluster Details')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Version')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('API Server Address')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('Nodes')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Events')
      .should('be.visible');
  });

  it('Go to Node details', () => {
    cy.getIframeBody()
      .find('[data-testid=cluster-nodes]')
      .within(_ => {
        cy.get('a')
          .first()
          .click();
      });
  });

  it('Test Node details', () => {
    cy.getIframeBody()
      .contains('Pod CIDR')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('Internal IP')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('Hostname')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('CPU')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Machine info')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Events')
      .should('be.visible');
  });
});
