/// <reference types="cypress" />

import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-customresourcedefinisions.yaml';
const SCOPE = 'Namespaced';

async function loadCRD(scope, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.spec.scope = scope;

  return newResource;
}

function getQueryInput() {
  return cy.get('[aria-label=command-palette-search]');
}

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();

    cy.get('body').type(
      `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
    );

    getQueryInput().type('up');

    cy.contains('Upload YAML').click();

    cy.wrap(loadCRD(SCOPE, FILE_NAME)).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.get('[role="dialog"]')
      .contains('button', 'Submit')
      .click();

    cy.get('[role="dialog"]')
      .contains('button', 'Close')
      .click();
  });

  it('Check CR groups list', () => {
    cy.navigateTo('Configuration', 'Custom Resources');

    cy.contains('h3', 'Custom Resources').should('be.visible');

    cy.get('[role="search"] [aria-label="open-search"]').type('cypress');

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
