/// <reference types="cypress" />
const DESC = 'beautiful, pretty cluster for all our test needs';
const TEMP_NAME = 'clustered';

let originalName;

context('Test edit cluster', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Changes cluster name and adds description', () => {
    cy.get('[data-testid=app-switcher]').click();
    cy.get('[data-testid=clusters-overview]').click();

    cy.getIframeBody()
      .find('.fd-table__body .fd-table__cell')
      .eq(0)
      .then(el => (originalName = el.text()));

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
      .type(originalName);

    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    cy.contains(originalName)
      .should('be.visible')
      .click();
  });
});
