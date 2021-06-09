/// <reference types="cypress" />
import config from '../config';

context('Create Namespace', () => {
  before(cy.loginAndSelectCluster);

  it('Create Namespace', () => {
    // generate random namespace name if it wasn't provided as env
    cy.task('getNamespace').then(ns => {
      if (!ns) {
        const random = Math.floor(Math.random() * 9999) + 1000;
        cy.task('setNamespace', `a-busola-test-${random}`);
      }
    });

    cy.getIframeBody()
      .contains('Create Namespace')
      .click();

    cy.task('getNamespace').then(a => {
      cy.getIframeBody()
        .find('[role=dialog]')
        .find("input[placeholder='Namespace name']")
        .should('be.visible')
        .type(a);
    });

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });
});
