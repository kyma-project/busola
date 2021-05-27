/// <reference types="cypress" />
import config from '../config';

context('Busola - Create Namespace', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create Namespace', () => {
    cy.getIframeBody()
      .contains('Create Namespace')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find("input[placeholder='Namespace name']")
      .should('be.visible')
      .type(config.namespaceName);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });
});
