/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';
import jsyaml from 'js-yaml';

const SC_NAME = `sc-upload-yaml-${Math.random()
  .toString()
  .substr(2, 8)}`;

async function loadValidResources(namespaceName) {
  const resources = await loadFile('yaml-upload--valid.yaml', false);
  // deployment
  resources[0].metadata.namespace = namespaceName;
  // storage class
  resources[1].metadata.name = SC_NAME;
  return resources;
}

context('Test resource upload', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Creates resources', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.wrap(loadValidResources(Cypress.env('NAMESPACE_NAME'))).then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.contains('You will create 2 resources:').should('be.visible');
    cy.contains('Deployment echo-server-upload-yaml').should('be.visible');
    cy.contains('StorageClass ' + SC_NAME).should('be.visible');

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.contains('2/2').should('be.visible');

    cy.contains('Close').should('be.visible');

    cy.contains('Deployment echo-server-upload-yaml - Created').should(
      'be.visible',
    );

    cy.contains('StorageClass ' + SC_NAME + ' - Created').should('be.visible');
  });

  it('Upserts resources', () => {
    cy.wrap(loadValidResources(Cypress.env('NAMESPACE_NAME'))).then(
      resources => {
        resources[0].metadata.name = 'echo-server-upload-yaml-2';
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.contains('Deployment echo-server-upload-yaml-2 - Created').should(
      'be.visible',
    );

    cy.contains('StorageClass ' + SC_NAME + ' - Updated').should('be.visible');
  });

  it('Handles errors', () => {
    cy.wrap(loadValidResources(Cypress.env('NAMESPACE_NAME'))).then(
      resources => {
        resources[0].metadata.name = 'echo-server-upload-yaml';
        resources[0].apiVersion = '/apis/errors';
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.contains('Deployment echo-server-upload-yaml - Error').should(
      'be.visible',
    );
  });

  it('Cleanup', () => {
    // close
    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();

    cy.navigateTo('Storage', 'Storage Classes');

    cy.get('ui5-button[aria-label="open-search"]')
      .click()
      .get('ui5-combobox[placeholder="Search"]')
      .find('input')
      .click()
      .type(SC_NAME);

    cy.get('ui5-table-row [aria-label="Delete"]').click({ force: true });

    cy.get(`[header-text="Delete ${SC_NAME}"]`)
      .find('[data-testid="delete-confirmation"]')
      .click();
  });
});
