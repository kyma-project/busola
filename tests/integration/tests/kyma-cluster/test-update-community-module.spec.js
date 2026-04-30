/// <reference types="cypress" />

const MODULE_NAME = 'busola';
const OLD_VERSION = '0.0.11';
const NEW_VERSION = '0.0.12';
const OLD_FIXTURE_URL =
  'https://raw.githubusercontent.com/kyma-project/busola/refs/heads/main/tests/integration/fixtures/community-modules/busola-0-11.yaml';
const OLD_TEMPLATE_NAME = `${MODULE_NAME}-0-11`;
const KYMA_SYSTEM_NAMESPACE = 'kyma-system';

context('Test Update Community Module', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.url().should('match', /.*\/kymamodules/);
  });

  it(`Install community module ${MODULE_NAME} v${OLD_VERSION} as prerequisite`, () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Add')
      .click();

    cy.wait(1000);

    cy.get('ui5-title').contains('Add Community Modules').should('be.visible');

    cy.get('[accessible-name="add-yamls"]').click();

    cy.get(`[header-text="Add Source YAML"]:visible`)
      .find('[data-testid="add-to-namespace-select"]')
      .click();

    cy.get('ui5-option-custom:visible').contains('default').click();

    cy.get('[accessible-name="Source YAML URL"]')
      .find('input')
      .click()
      .clear()
      .type(OLD_FIXTURE_URL);

    cy.wait(1000);

    cy.get('ui5-button:visible').contains('Add').click();

    cy.wait(1000);

    cy.get('ui5-card').contains(MODULE_NAME).should('be.visible');

    cy.get('ui5-title').contains(MODULE_NAME).click();

    cy.wait(2000);

    cy.get('[data-testid="create-form-footer-bar"]')
      .contains('ui5-button:visible', 'Add')
      .click();

    cy.wait(2000);
  });

  it('Shows the Update button for an outdated community module', () => {
    cy.inspectTab('View');

    cy.wait(1000);

    cy.get('.community-modules-list')
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .type(MODULE_NAME);

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(MODULE_NAME)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(OLD_VERSION)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .should('be.visible');
  });

  it('Opens the update confirmation dialog with version info and the delete checkbox checked by default', () => {
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .click();

    cy.get('.update-module-dialog').should('be.visible');

    cy.get('.update-module-dialog')
      .contains('Update Module')
      .should('be.visible');

    cy.get('.update-module-dialog').contains(MODULE_NAME).should('be.visible');

    cy.get('.update-module-dialog')
      .contains(`Current version: ${OLD_VERSION}`)
      .should('be.visible');

    cy.get('.update-module-dialog')
      .contains(`Latest version: ${NEW_VERSION}`)
      .should('be.visible');

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .should('be.visible');

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .find('[type="checkbox"]')
      .should('be.checked');
  });

  it('Cancels the update dialog without applying changes', () => {
    cy.get('.update-module-dialog')
      .find('ui5-button')
      .contains('Cancel')
      .click();

    cy.get('.update-module-dialog').should('not.exist');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(OLD_VERSION)
      .should('be.visible');
  });

  it('Checkbox resets to checked each time the dialog is reopened', () => {
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .click();

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .click();

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .find('[type="checkbox"]')
      .should('not.be.checked');

    cy.get('.update-module-dialog')
      .find('ui5-button')
      .contains('Cancel')
      .click();

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .click();

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .find('[type="checkbox"]')
      .should('be.checked');

    cy.get('.update-module-dialog')
      .find('ui5-button')
      .contains('Cancel')
      .click();
  });

  it('Updates the community module without deleting the old ModuleTemplates', () => {
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .click();

    cy.get('.update-module-dialog').should('be.visible');

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .click();

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .find('[type="checkbox"]')
      .should('not.be.checked');

    cy.get('.update-module-dialog')
      .find('ui5-button')
      .contains('Update')
      .click();

    cy.get('ui5-toast').contains('Module update started').should('be.visible');
    cy.contains('ui5-toast', 'Community Modules updated').should('be.visible');

    cy.wait(3000);

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(MODULE_NAME)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(NEW_VERSION)
      .should('be.visible');

    // Verify the old ModuleTemplate still exists
    cy.goToNamespaceDetails(KYMA_SYSTEM_NAMESPACE);
    cy.navigateTo('Configuration', 'Custom Resources');
    cy.typeInSearch('ModuleTemplates', true);
    cy.clickGenericListLink('ModuleTemplates');

    cy.getMidColumn()
      .get('ui5-input[id^=search-]:visible')
      .find('input')
      .should('be.visible')
      .type(OLD_TEMPLATE_NAME, { force: true });

    cy.get('ui5-table-row').contains(OLD_TEMPLATE_NAME).should('be.visible');

    cy.getLeftNav().contains('Cluster Overview').click();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.inspectTab('View');
  });

  it('Update button is not visible when no updates are available', () => {
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .should('not.exist');
  });

  it(`Cleans up: reinstall v${OLD_VERSION} to prepare for delete-old-templates test`, () => {
    cy.inspectTab('Edit');

    cy.wait(1000);

    cy.contains('ui5-label', MODULE_NAME).should('be.visible');

    cy.contains('ui5-label', MODULE_NAME).parent().find('ui5-select').click();

    cy.wait(500);

    cy.get('ui5-option:visible').contains(OLD_VERSION).click();

    cy.wait(2000);

    cy.get('ui5-panel[data-testid="community-modules-edit"]')
      .find('ui5-button')
      .contains('Save')
      .click();

    cy.contains('Community Modules updated').should('be.visible');

    cy.inspectTab('View');
  });

  it('Updates the community module and deletes all old ModuleTemplates when checkbox is checked', () => {
    cy.wait(1000);

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .click();

    cy.get('.update-module-dialog').should('be.visible');

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .find('[type="checkbox"]')
      .should('be.checked');

    cy.get('.update-module-dialog')
      .find('ui5-button')
      .contains('Update')
      .click();

    cy.get('ui5-toast').contains('Module update started').should('be.visible');
    cy.contains('ui5-toast', 'Community Modules updated').should('be.visible');

    cy.wait(3000);

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(NEW_VERSION)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .should('not.exist');

    // Verify the old ModuleTemplate was deleted
    cy.goToNamespaceDetails(KYMA_SYSTEM_NAMESPACE);
    cy.navigateTo('Configuration', 'Custom Resources');
    cy.typeInSearch('ModuleTemplates', true);
    cy.clickGenericListLink('ModuleTemplates');

    cy.getMidColumn()
      .get('ui5-input[id^=search-]:visible')
      .find('input')
      .should('be.visible')
      .type(OLD_TEMPLATE_NAME, { force: true });

    cy.get('ui5-table-row').contains(OLD_TEMPLATE_NAME).should('not.exist');

    cy.getLeftNav().contains('Cluster Overview').click();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.inspectTab('View');
  });

  it('Cleans up the installed module', () => {
    cy.deleteFromGenericList('Module', MODULE_NAME, {
      parentSelector: '.community-modules-list',
      searchInPlainTableText: true,
      deletedVisible: false,
      waitForDelete: 2000,
      customHeaderText: 'Delete Module',
    });
  });
});
