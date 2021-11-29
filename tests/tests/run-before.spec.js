/// <reference types="cypress" />
import config from '../config';

const busolaConfig =
  '{ "config": { "features": { "PROTECTED_RESOURCES": { "isEnabled": true, "config": { "resources": [ { "match": { "$.metadata.labels.protected": "true" } } ] } } } } }';

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
        .find("input[placeholder='Namespace Name']")
        .should('be.visible')
        .type(a);
    });

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Delete old busola config', () => {
    cy.url().then(url => cy.visit(`${url}/kube-public/configmaps`));

    cy.on('fail', () => false);

    cy.getIframeBody()
      .contains('tr', 'busola-config')
      .find('button[aria-label="Delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();
  });

  it('Create busola config', () => {
    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Config Map Name"]:visible')
      .type('busola-config');

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]:visible')
      .type('config');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]:visible')
      .eq(0)
      .type(busolaConfig, { parseSpecialCharSequences: false });

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });
});
