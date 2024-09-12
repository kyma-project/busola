import { loadFile } from '../../support/loadFile';

const QUOTA_NAME = `test-rq-${Math.floor(Math.random() * 9999) + 1000}`;
const FILE_NAME = 'test-resource-quotas.yaml';

async function loadRQ(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}

context('Test Resource Quotas', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Creates a Resource Quota', () => {
    cy.navigateTo('Discovery and Network', 'Resource Quotas');

    cy.openCreate();

    cy.wrap(loadRQ(QUOTA_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      RQ_CONFIG => {
        const RQ = JSON.stringify(RQ_CONFIG);
        cy.pasteToMonaco(RQ);
      },
    );

    cy.saveChanges('Create');
  });

  it('Checks the details view', () => {
    cy.contains(QUOTA_NAME);

    cy.contains('Limits and Usage');
    cy.contains('Scope Selectors');
    cy.contains('PriorityClass');
  });

  it('Checks the list view', () => {
    cy.getLeftNav()
      .contains('Resource Quotas')
      .click();

    cy.clickGenericListLink(QUOTA_NAME);

    cy.getMidColumn().contains(QUOTA_NAME);

    cy.closeMidColumn();

    cy.deleteFromGenericList('Resource Quota', QUOTA_NAME);
  });
});
