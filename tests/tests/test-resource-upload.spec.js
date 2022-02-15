/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';
import jsyaml from 'js-yaml';

const APPLICATION_NAME = `test-mock-app-${Cypress.env(
  'NAMESPACE_NAME',
)}-upload-yaml`;

async function loadValidResources(namespaceName) {
  const resources = await loadFile('yaml-upload--valid.yaml', false);
  // deployment
  resources[0].metadata.namespace = namespaceName;
  // application
  resources[1].metadata.name = APPLICATION_NAME;
  return resources;
}

context('Test resource upload', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Creates resources', () => {
    cy.getLeftNav()
      .contains('Cluster Overview')
      .click();

    cy.getIframeBody()
      .contains('Upload YAML')
      .click();

    cy.wrap(loadValidResources(Cypress.env('NAMESPACE_NAME'))).then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.getIframeBody()
      .contains('You will create 2 resources:')
      .should('be.visible');
    cy.getIframeBody()
      .contains('Deployment echo-server-upload-yaml')
      .should('be.visible');
    cy.getIframeBody()
      .contains('Application ' + APPLICATION_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains('Submit')
      .click();

    cy.getIframeBody()
      .contains('2/2')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Deployment echo-server-upload-yaml - Created')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Application ' + APPLICATION_NAME + ' - Created')
      .should('be.visible');
  });

  it('Upserts resources', () => {
    cy.wrap(loadValidResources(Cypress.env('NAMESPACE_NAME'))).then(
      resources => {
        resources[0].metadata.name = 'echo-server-upload-yaml-2';
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.getIframeBody()
      .contains('Submit')
      .click();

    cy.getIframeBody()
      .contains('Deployment echo-server-upload-yaml-2 - Created')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Application ' + APPLICATION_NAME + ' - Updated')
      .should('be.visible');
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

    cy.getIframeBody()
      .contains('Submit')
      .click();

    cy.getIframeBody()
      .contains('Deployment echo-server-upload-yaml - Error')
      .should('be.visible');
  });
});
