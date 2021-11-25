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
        .find("input[placeholder='Namespace Name']:visible")
        .type(a);
    });

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Apply total memory quotas')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('label', 'Create additional resource')
      .first()
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Select a Preset')
      .first()
      .click();

    cy.getIframeBody()
      .find('[class*=fd-list--dropdown]')
      .contains('li', 'M (limits')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    cy.task('getNamespace').then(ns => {
      cy.getIframeBody()
        .contains('h3', ns)
        .should('be.visible');
    });

    cy.getIframeBody()
      .contains('initial-limits')
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
