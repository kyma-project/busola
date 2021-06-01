/// <reference types="cypress" />
import config from '../config';

context('Create Namespace', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create Namespace', () => {
    sessionStorage.clear();
    if (!config.namespaceName) {
      // generate random namespace name if it wasn't provided as env

      const random = Math.floor(Math.random() * 9999) + 1000;
      config.namespaceName = `a-busola-test-${random}`;
    }

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
