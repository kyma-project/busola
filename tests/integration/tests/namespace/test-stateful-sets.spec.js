import { grantClipboardPermissions } from '../../support/helpers';
import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-stateful-sets.yaml';

const SS_NAME = 'test-' + Math.random().toString().substr(2, 8);

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

    cy.openCreate();

    cy.wrap(loadSS(SS_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      (SS_CONFIG) => {
        const SS = JSON.stringify(SS_CONFIG);
        cy.pasteToMonaco(SS);
      },
    );

    cy.saveChanges('Create');

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

  it('Check if Copy button works correctly', () => {
    grantClipboardPermissions();
    cy.inspectTab('Edit');

    // Stub window.prompt so browser popup never shows
    cy.window().then((win) => {
      cy.stub(win, 'prompt')
        .callsFake((msg, value) => {
          expect(value).to.contain('kind: StatefulSet');
          return value;
        })
        .as('copyPrompt');
    });

    cy.get('ui5-button[icon="copy"]:visible').click({ force: true });

    cy.contains(`Copied ${SS_NAME}.yaml to clipboard`).should('be.visible');
    cy.wait(2100);
    cy.contains(`Copied ${SS_NAME}.yaml to clipboard`).should('not.exist');

    cy.get('@copyPrompt').should('have.been.called');
  });

  it('Check if Reset button works correctly', () => {
    cy.navigateTo('Workloads', 'Stateful Sets');

    cy.openCreate();

    cy.wrap(loadSS(SS_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      (SS_CONFIG) => {
        const SS = JSON.stringify(SS_CONFIG);
        cy.pasteToMonaco(SS);
      },
    );

    cy.get('body').click();

    cy.findMonaco().should('include.value', SS_NAME);

    cy.get('ui5-button:visible').contains('Reset').click();
    cy.get('ui5-dialog[header-text="Discard Changes"]').should('be.visible');

    cy.get('ui5-dialog[header-text="Discard Changes"]:visible')
      .find('ui5-button')
      .contains('Discard')
      .click();

    cy.findMonaco().should('include.value', "name: ''");
  });

  it('Inspect list', () => {
    cy.wait(3000); // wait for the resource to be refeched and displayed in the list
    cy.inspectList(SS_NAME);
  });
});
