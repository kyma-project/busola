import { loadFile } from '../../support/loadFile';

const LIMIT_NAME = `test-lr-${Math.floor(Math.random() * 9999) + 1000}`;
const FILE_NAME = 'test-limit-ranges.yaml';

async function loadLR(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}

context('Test Limit Ranges', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Creates a Limit Range', () => {
    cy.navigateTo('Discovery and Network', 'Limit Ranges');

    cy.openCreate();

    cy.wrap(loadLR(LIMIT_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      LR_CONFIG => {
        const LR = JSON.stringify(LR_CONFIG);
        cy.pasteToMonaco(LR);
      },
    );

    cy.saveChanges('Create');
  });

  it('Checks the details view', () => {
    cy.contains(LIMIT_NAME);

    cy.contains('Container');
    cy.contains('memory');
  });

  it('Checks the list view', () => {
    cy.getLeftNav()
      .contains('Limit Ranges')
      .click();

    cy.clickGenericListLink(LIMIT_NAME);

    cy.getMidColumn().contains(LIMIT_NAME);

    cy.closeMidColumn();

    cy.deleteFromGenericList('Limit Range', LIMIT_NAME);
  });
});
