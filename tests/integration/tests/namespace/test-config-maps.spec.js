const CONFIG_MAP_NAME = `test-config-map-${Math.floor(Math.random() * 9999) +
  1000}`;
const CLONE_NAME = `${CONFIG_MAP_NAME}-clone`;

const ENTRY_KEY = 'config-map-key';
const ENTRY_VALUE = 'config-map-value';

const ENTRY_KEY2 = 'config-map-alt-key';
const ENTRY_VALUE2 = 'config-map-alt-value';

context('Test Config Maps', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Config Map', () => {
    cy.navigateTo('Configuration', 'Config Maps');

    cy.openCreate();

    cy.get('[aria-label="ConfigMap name"]:visible')
      .find('input')
      .type(CONFIG_MAP_NAME, { force: true })
      .click();

    cy.get('[placeholder="Enter key"]:visible')
      .find('input')
      .type(ENTRY_KEY);

    cy.findMonaco().type(ENTRY_VALUE);

    cy.createResource();

    cy.url().should('match', new RegExp(`/configmaps/${CONFIG_MAP_NAME}`));
  });

  it('Inspect the Config Map', () => {
    cy.contains('ui5-panel', ENTRY_KEY).contains(ENTRY_VALUE);
  });

  it('Edit the Config Map', () => {
    cy.wait(1000);

    cy.inspectTab('Edit');

    // hide first entry so Cypress doesn't get confuused
    cy.get('[aria-label="expand config-map-key"]').click();

    cy.get('[placeholder="Enter key"]:visible')
      .find('input')
      .type(ENTRY_KEY2);

    cy.findMonaco().type(ENTRY_VALUE2);

    cy.saveEdit();
  });

  it('Inspect the updated Config Map', () => {
    cy.getMidColumn().inspectTab('View');

    cy.getMidColumn()
      .contains('ui5-panel', ENTRY_KEY2)
      .contains(ENTRY_VALUE2);
  });

  it('Inspect list', () => {
    cy.inspectList(CONFIG_MAP_NAME);
  });

  it('Clone the secret', () => {
    cy.contains('ui5-table-row', CONFIG_MAP_NAME)
      .find('ui5-button[data-testid="clone"]')
      .click();

    cy.get('[aria-label="ConfigMap name"]:visible')
      .find('input')
      .click()
      .type(CLONE_NAME)
      .click();

    cy.createResource();
  });

  it('Inspect the clone', () => {
    cy.getMidColumn().contains(CLONE_NAME);

    cy.getMidColumn()
      .contains('ui5-panel', ENTRY_KEY)
      .contains(ENTRY_VALUE);

    cy.getMidColumn()
      .contains('ui5-panel', ENTRY_KEY2)
      .contains(ENTRY_VALUE2);
  });
});
