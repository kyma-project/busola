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

    // this is to address a Luigi race condition, can be removed together with Luigi
    cy.wait(500);

    cy.contains('h3', 'Cluster Details').should('be.visible');

    cy.contains('Version')
      .next('.content')
      .should('not.be.empty');

    cy.contains('API Server Address')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Nodes').should('be.visible');

    cy.contains('Events').should('be.visible');
  });

  it('Go to Node details', () => {
    cy.get('[data-testid=cluster-nodes]').within(_ => {
      cy.get('a')
        .first()
        .click();
    });
  });

  it('Test Node details', () => {
    cy.contains('Pod CIDR')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Internal IP')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Hostname')
      .next('.content')
      .should('not.be.empty');

    cy.contains('CPU').should('be.visible');

    cy.contains('Machine info').should('be.visible');

    cy.contains('Events').should('be.visible');
  });
});
