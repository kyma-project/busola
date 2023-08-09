/// <reference types="cypress" />

import { loadFile } from '../../support/loadFile';
import { generateRandomString } from '../../support/generateRandomString';

const FILE_NAME = 'test-customresourcedefinisions.yaml';

const CR_PLURAL_NAME = generateRandomString(7);
const CR_NAME = CR_PLURAL_NAME + '.cypress.example.com';

function openSearchWithSlashShortcut() {
  cy.get('body').type('/', { force: true });
}
async function loadCR(name, plural, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.spec.names.plural = plural;
  newResource.spec.names.singular = plural;

  return newResource;
}
context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Custom Resource Definitions');

    cy.contains('Create Custom Resource Definition').click();

    cy.wrap(loadCR(CR_NAME, CR_PLURAL_NAME, FILE_NAME)).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check CR groups list with slash shortcut', () => {
    cy.getLeftNav()
      .contains('Custom Resources', { includeShadowDom: true })
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
    cy.contains(CR_NAME).click();
    cy.url().should('match', /customresourcedefinitions/);
    cy.deleteInDetails();
  });
});
