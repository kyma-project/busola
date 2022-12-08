/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';
import jsyaml from 'js-yaml';

const APPLICATION_NAME = `${Cypress.env('APP_NAME')}-upload-yaml`;

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
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions([
      'examples/resources/applicationconnector/applications.yaml',
    ]);

    cy.loginAndSelectCluster();
  });

  it('Creates resources', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    // this is to address a Luigi race condition, can be removed together with Luigi
    cy.wait(500);

    cy.contains('Upload YAML').click();

    cy.wrap(loadValidResources(Cypress.env('NAMESPACE_NAME'))).then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.contains('You will create 2 resources:').should('be.visible');
    cy.contains('Deployment echo-server-upload-yaml').should('be.visible');
    cy.contains('Application ' + APPLICATION_NAME).should('be.visible');

    cy.contains('Submit').click();

    cy.contains('2/2').should('be.visible');

    cy.contains('Close').should('be.visible');

    cy.contains('Deployment echo-server-upload-yaml - Created').should(
      'be.visible',
    );

    cy.contains('Application ' + APPLICATION_NAME + ' - Created').should(
      'be.visible',
    );
  });

  it('Upserts resources', () => {
    cy.wrap(loadValidResources(Cypress.env('NAMESPACE_NAME'))).then(
      resources => {
        resources[0].metadata.name = 'echo-server-upload-yaml-2';
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.contains('Submit').click();

    cy.contains('Deployment echo-server-upload-yaml-2 - Created').should(
      'be.visible',
    );

    cy.contains('Application ' + APPLICATION_NAME + ' - Updated').should(
      'be.visible',
    );
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

    cy.contains('Submit').click();

    cy.contains('Deployment echo-server-upload-yaml - Error').should(
      'be.visible',
    );
  });

  it('Cleanup', () => {
    // close
    cy.get('body').type('{esc}');

    cy.get('[role=dialog]').should('not.exist');

    cy.navigateTo('Integration', 'Applications');

    cy.get('[role="search"] [aria-label="open-search"]').type(APPLICATION_NAME);

    cy.get('tbody tr [aria-label="Delete"]').click({ force: true });

    cy.contains('button', 'Delete').click();
  });
});
