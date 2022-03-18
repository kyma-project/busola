import { deleteFromGenericList } from '../../support/helpers';

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

    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Config Map name"]:visible')
      .type(CONFIG_MAP_NAME)
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .type(`${ENTRY_KEY}{enter}{backspace}${ENTRY_VALUE}`);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.url().should(
      'match',
      new RegExp(`/configmaps/details/${CONFIG_MAP_NAME}$`),
    );
  });

  it('Inspect the Config Map', () => {
    cy.getIframeBody().contains(CONFIG_MAP_NAME);

    cy.getIframeBody()
      .contains('.fd-layout-panel', ENTRY_KEY)
      .contains(ENTRY_VALUE);
  });

  it('Edit the Config MAp', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .eq(1)
      .type(`${ENTRY_KEY2}{enter}{backspace}${ENTRY_VALUE2}`);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();
  });

  it('Inspect the updated Config Map', () => {
    cy.getIframeBody()
      .contains('.fd-layout-panel', ENTRY_KEY2)
      .contains(ENTRY_VALUE2);
  });

  it('Inspect list', () => {
    cy.inspectList('Config Maps', CONFIG_MAP_NAME);
  });

  it('Clone the secret', () => {
    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', CONFIG_MAP_NAME)
      .find('button[data-testid="clone"]')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Config Map name"]:visible')
      .type(CLONE_NAME)
      .click();

    cy.getIframeBody()
      .contains('button', /^Create$/)
      .click();
  });

  it('Inspect the clone', () => {
    cy.getIframeBody().contains(CLONE_NAME);

    cy.getIframeBody()
      .contains('.fd-layout-panel', ENTRY_KEY)
      .contains(ENTRY_VALUE);

    cy.getIframeBody()
      .contains('.fd-layout-panel', ENTRY_KEY2)
      .contains(ENTRY_VALUE2);
  });

  it('Delete Config Maps', () => {
    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    deleteFromGenericList(CLONE_NAME);

    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    deleteFromGenericList(CONFIG_MAP_NAME);
  });
});
