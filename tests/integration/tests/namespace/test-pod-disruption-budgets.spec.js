import { loadFile } from '../../support/loadFile';

const PDB_NAME = `test-pdb-${Math.floor(Math.random() * 9999) + 1000}`;
const FILE_NAME = 'test-pod-disruption-budgets.yaml'; //stworzyc// w calym pliku testowym sprawdzic pozostalosci limit ranges i puscic lokalnie

async function loadPDB(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}

context('Test Pod Disruption Budgets', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Creates a Pod Disruption Budget', () => {
    cy.navigateTo('Configuration', 'Pod Disruption Budgets');

    cy.openCreate();

    cy.wrap(loadPDB(PDB_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      (PDB_CONFIG) => {
        const PDB = JSON.stringify(PDB_CONFIG);
        cy.pasteToMonaco(PDB);
      },
    );

    cy.saveChanges('Create');
  });

  it('Checks the details view', () => {
    cy.contains(PDB_NAME);

    cy.contains('Minimum Available').parent().contains('1');
  });

  it('Checks the list view', () => {
    cy.getLeftNav().contains('Pod Disruption Budgets').click();

    cy.clickGenericListLink(PDB_NAME);

    cy.getMidColumn().contains(PDB_NAME);

    cy.closeMidColumn();

    cy.deleteFromGenericList('Pod Disruption Budget', PDB_NAME);
  });
});
