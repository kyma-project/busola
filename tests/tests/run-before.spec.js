/// <reference types="cypress" />
import config from '../config';

context('Create Namespace', () => {
  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('Create Namespace')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find("input[placeholder='Namespace Name']:visible")
      .type(Cypress.env('NAMESPACE_NAME'));

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', Cypress.env('NAMESPACE_NAME'))
      .should('be.visible');

    cy.getIframeBody()
      .contains('button', 'Edit')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find('label[class="fd-switch"]')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();

    cy.getIframeBody()
      .contains('istio-injection=disabled')
      .should('be.visible');
  });
});
