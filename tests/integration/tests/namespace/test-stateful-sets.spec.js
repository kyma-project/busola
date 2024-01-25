import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-stateful-sets.yaml';

const SS_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

async function loadSS(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}

context('Test Stateful Sets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Stateful Set', () => {
    cy.navigateTo('Workloads', 'Stateful Sets');

    cy.contains('ui5-button', 'Create Stateful Set').click();

    cy.wrap(loadSS(SS_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      SS_CONFIG => {
        const SS = JSON.stringify(SS_CONFIG);
        cy.pasteToMonaco(SS);
      },
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();

    cy.contains('ui5-title', SS_NAME).should('be.visible');
  });

  it('Inspect details', () => {
    // name
    cy.getMidColumn().contains(SS_NAME);
    // selector
    cy.getMidColumn().contains('app=nginx');
    // pod
    cy.getMidColumn().contains(`${SS_NAME}-0`);
    cy.getMidColumn().contains('registry.k8s.io/nginx-slim:0.8');
    cy.getMidColumn().contains('/usr/share/nginx/html');
    cy.getMidColumn().contains('web:80/TCP');
  });

  it('Inspect list', () => {
    cy.inspectList('Stateful Sets', SS_NAME);
  });
});
