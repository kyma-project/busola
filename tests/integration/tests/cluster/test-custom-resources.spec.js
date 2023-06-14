/// <reference types="cypress" />

import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-customresourcedefinisions.yaml';

function openSearchWithSlashShortcut() {
  cy.get('body').type('/');
}

function getQueryInput() {
  return cy.get('[aria-label=command-palette-search]');
}

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Custom Resource Definitions');

    cy.contains('Create Custom Resource Definition').click();

    cy.wrap(loadFile(FILE_NAME)).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check CR groups list with slash shortcut', () => {
    cy.getLeftNav()
      .contains('Custom Resources')
      .click();

    cy.contains('h3', 'Custom Resources').should('be.visible');

    openSearchWithSlashShortcut();

    cy.get('[type="search"]').type('cypress');

    cy.get('table').should('have.length', 1);

    cy.get('[role=row]')
      .contains('CronTabs')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('[role=row]')
      .contains('CronTabs')
      .click();

    cy.get('[aria-label="title"]')
      .contains('CronTabs')
      .should('be.visible');

    cy.contains(/Create Cron Tab/i).should('be.visible');

    cy.url().should('match', /customresources/);
    cy.contains('test.cypress.example.com').click();
    cy.url().should('match', /customresourcedefinitions/);
    cy.deleteInDetails();
  });
});
