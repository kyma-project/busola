/// <reference types="cypress" />
const DESC = 'beautiful, pretty cluster for all our test needs';
const ORIGINAL_NAME = 'shoot--kyma-prow--nkyma';
const TEMP_NAME = 'clustered';

context('Edit cluster', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Changes cluster name and adds description', () => {
    cy.contains(ORIGINAL_NAME).click();

    cy.contains('Clusters Overview').click();

    cy.getIframeBody()
      .find('button[data-testid="edit"]')
      .click();

    cy.getIframeBody()
      .find('input[data-testid="cluster-description"]')
      .click()
      .type(DESC);

    cy.getIframeBody()
      .find('input[date-testid="cluster-name"]')
      .first()
      .type(`{selectall}{backspace}`)
      .type(TEMP_NAME);

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    cy.contains(TEMP_NAME)
      .should('be.visible')
      .click();

    cy.contains('Clusters Overview').click();

    cy.getIframeBody()
      .contains(DESC)
      .should('be.visible');
  });

  it('Restores previous settings', () => {
    cy.getIframeBody()
      .find('button[data-testid="edit"]')
      .click();

    cy.getIframeBody()
      .find('input[date-testid="cluster-name"]')
      .first()
      .type(`{selectall}{backspace}`)
      .type(ORIGINAL_NAME);

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    cy.contains(ORIGINAL_NAME)
      .should('be.visible')
      .click();
  });
});
