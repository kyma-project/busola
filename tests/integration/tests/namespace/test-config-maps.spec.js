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

    cy.get('ui5-button')
      .contains('Create Config Map')
      .click();

    cy.get('[ariaLabel="ConfigMap name"]:visible')
      .type(CONFIG_MAP_NAME)
      .click();

    cy.get('[placeholder="Enter key"]:visible').type(ENTRY_KEY);

    cy.findMonaco()
      .first()
      .type(ENTRY_VALUE);

    cy.get('ui5-dialog[accessible-role="Dialog"]')
      .get('ui5-button.ui5-bar-content')
      .contains('Create')
      .should('be.visible')
      .click();

    cy.url().should('match', new RegExp(`/configmaps/${CONFIG_MAP_NAME}$`));
  });

  it('Inspect the Config Map', () => {
    cy.contains(CONFIG_MAP_NAME);

    cy.contains('.fd-layout-panel', ENTRY_KEY).contains(ENTRY_VALUE);
  });

  it('Edit the Config Map', () => {
    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    // hide first entry so Cypress doesn't get confuused
    cy.get('[aria-label="expand config-map-key"]').click();

    cy.get('[placeholder="Enter key"]:visible').type(ENTRY_KEY2);

    cy.findMonaco(0).type(ENTRY_VALUE2);

    cy.get('ui5-dialog[accessible-role="Dialog"]')
      .get('ui5-button.ui5-bar-content')
      .contains('Update')
      .should('be.visible')
      .click();
  });

  it('Inspect the updated Config Map', () => {
    cy.contains('.fd-layout-panel', ENTRY_KEY2).contains(ENTRY_VALUE2);
  });

  it('Inspect list', () => {
    cy.inspectList('Config Maps', CONFIG_MAP_NAME);
  });

  it('Clone the secret', () => {
    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.contains('.fd-table__row', CONFIG_MAP_NAME)
      .find('ui5-button[data-testid="clone"]')
      .click();

    cy.get('[ariaLabel="ConfigMap name"]:visible')
      .type(CLONE_NAME)
      .click();

    cy.get('ui5-button.ui5-bar-content')
      .contains('Create')
      .should('be.visible')
      .click();
  });

  it('Inspect the clone', () => {
    cy.contains(CLONE_NAME);

    cy.contains('.fd-layout-panel', ENTRY_KEY).contains(ENTRY_VALUE);

    cy.contains('.fd-layout-panel', ENTRY_KEY2).contains(ENTRY_VALUE2);
  });
});
