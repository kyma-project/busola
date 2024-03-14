/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-daemon-sets.yaml';

const DS_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

async function loadDS(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}

context('Test Daemon Sets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Daemon Set', () => {
    cy.navigateTo('Workloads', 'Daemon Sets');

    cy.openCreate();

    cy.wrap(loadDS(DS_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      DS_CONFIG => {
        const DS = JSON.stringify(DS_CONFIG);
        cy.pasteToMonaco(DS);
      },
    );

    cy.createResource();
  });

  it('Inspect details', () => {
    // name
    cy.getMidColumn().contains(DS_NAME);
    // tolerations
    cy.getMidColumn().contains('node-role.kubernetes.io/control-plane');
    cy.getMidColumn().contains('node-role.kubernetes.io/master');
    // selector
    cy.getMidColumn().contains('name=fluentd-elasticsearch');
    // pod
    cy.getMidColumn().contains('quay.io/fluentd_elasticsearch/fluentd:v2.5.2');
    cy.getMidColumn().contains('/var/log');
    cy.getMidColumn().contains('varlog');
    cy.getMidColumn().contains('hostPath');
  });

  it('Inspect list', () => {
    cy.wait(3000); // wait for the resource to be refeched and displayed in the list
    cy.inspectList(DS_NAME);
  });
});
