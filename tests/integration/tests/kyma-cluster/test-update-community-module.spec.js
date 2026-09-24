/// <reference types="cypress" />

const MODULE_NAME = 'busola';
const OLD_VERSION = '1.0.31';
const NEW_VERSION = '1.0.32';
const OLD_FIXTURE_URL =
  'https://raw.githubusercontent.com/kyma-project/busola/refs/heads/main/tests/integration/fixtures/community-modules/busola-1-0-31.yaml';
const OLD_TEMPLATE_NAME = `${MODULE_NAME}-1-0-31`;
// Templates are installed into `default` (see prerequisite test)
const INSTALL_NAMESPACE = 'default';

context('Test Update Community Module', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.url().should('match', /.*\/kymamodules/);
    cy.get('ui5-dynamic-page.kyma-modules')
      .find('ui5-dynamic-page-title')
      .should('be.visible');
  });

  it(`Install community module ${MODULE_NAME} ${OLD_VERSION} as prerequisite`, () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Add')
      .click();

    cy.get('ui5-title').contains('Add Community Modules').should('be.visible');

    cy.get('[accessible-name="add-yamls"]').click();

    cy.get('[accessible-name="Source YAML URL"]')
      .find('input')
      .click()
      .clear()
      .type(OLD_FIXTURE_URL);

    cy.get(`[header-text="Add Source YAML"]:visible`)
      .find('[data-testid="add-to-namespace-select"]')
      .should('be.visible')
      .click();

    cy.get('ui5-option-custom:visible').contains('default').click();

    cy.get('ui5-dialog[header-text="Add Source YAML"]')
      .find('ui5-button:visible')
      .contains('Add')
      .click();

    cy.get('ui5-card', { timeout: 15000 })
      .contains(MODULE_NAME)
      .should('be.visible');

    cy.get('ui5-title').contains(MODULE_NAME).click();

    cy.get(`[data-testid="module-settings-panel-${MODULE_NAME}"]`)
      .contains('Advanced')
      .click();

    cy.get(`[data-testid="module-settings-panel-${MODULE_NAME}"]`)
      .find('ui5-select')
      .should('be.visible')
      .click();

    cy.get('ui5-option:visible').contains(OLD_VERSION).click();

    cy.wait(2000);

    cy.get('[data-testid="create-form-footer-bar"]')
      .contains('ui5-button:visible', 'Add')
      .click();
  });

  it('Shows the Update button for an outdated community module', () => {
    cy.inspectTab('View');

    cy.get('.community-modules-list')
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .should('not.be.disabled')
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

    // the toast shows "started" right after the click, then swaps to "updated"
    // once the async work finishes - give the second assertion room to wait
    cy.get('ui5-toast[accessible-name="notification-content"]').should(
      'contain.text',
      'Module update started',
    );
    cy.get('ui5-toast[accessible-name="notification-content"]', {
      timeout: 30000,
    }).should('contain.text', 'Community Modules updated');

    cy.get('.community-modules-list', { timeout: 15000 })
      .find('ui5-table-row')
      .contains(MODULE_NAME)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(NEW_VERSION)
      .should('be.visible');

    // Verify the old ModuleTemplate still exists
    cy.goToNamespaceDetails(INSTALL_NAMESPACE);
    cy.navigateTo('Configuration', 'Custom Resources');
    cy.typeInSearch('ModuleTemplates', true);
    cy.clickGenericListLink('ModuleTemplates');

    cy.getMidColumn()
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .should('be.visible')
      .type(OLD_TEMPLATE_NAME, { force: true });

    cy.get('ui5-table-row')
      .contains(OLD_TEMPLATE_NAME, { timeout: 30000 })
      .should('be.visible');
  });

  it('Update button is not visible when no updates are available', () => {
    cy.goToClusterOverview();
    cy.get('ui5-card').contains('Modify Modules').click();

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .should('not.exist');
  });

  it(`Reinstall old version to prepare for delete-old-templates test`, () => {
    cy.inspectTab('Edit');

    cy.contains('ui5-label', MODULE_NAME).should('be.visible');

    // Save stays disabled until the picked version's resources download
    cy.intercept('POST', '**/modules/community-resource').as(
      'resourcesToApply',
    );

    cy.contains('ui5-label', MODULE_NAME).parent().find('ui5-select').click();

    cy.get('ui5-option:visible').contains(OLD_VERSION).click();

    cy.wait('@resourcesToApply', { timeout: 30000 });

    cy.get('ui5-panel[data-testid="community-modules-edit"]')
      .find('ui5-button')
      .contains('Save')
      .should('not.be.disabled')
      .click();

    cy.inspectTab('View');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(OLD_VERSION, { timeout: 30000 })
      .should('be.visible');
  });

  it('Updates the community module and deletes all old ModuleTemplates when checkbox is checked', () => {
    cy.get('.community-modules-list', { timeout: 15000 })
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

    // the toast shows "started" right after the click, then swaps to "updated"
    // once the async work finishes - give the second assertion room to wait
    cy.get('ui5-toast[accessible-name="notification-content"]').should(
      'contain.text',
      'Module update started',
    );
    cy.get('ui5-toast[accessible-name="notification-content"]', {
      timeout: 30000,
    }).should('contain.text', 'Community Modules updated');

    cy.get('.community-modules-list', { timeout: 15000 })
      .find('ui5-table-row')
      .contains(NEW_VERSION)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .should('not.exist');

    // Verify the old ModuleTemplate was deleted
    cy.goToNamespaceDetails(INSTALL_NAMESPACE);
    cy.navigateTo('Configuration', 'Custom Resources');
    cy.typeInSearch('ModuleTemplates', true);
    cy.clickGenericListLink('ModuleTemplates');

    cy.getMidColumn()
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .should('be.visible')
      .type(OLD_TEMPLATE_NAME, { force: true });

    cy.get('ui5-table-row')
      .contains(OLD_TEMPLATE_NAME, { timeout: 30000 })
      .should('not.exist');
  });

  it('Cleans up the installed module', () => {
    cy.goToClusterOverview();
    cy.get('ui5-card').contains('Modify Modules').click();

    cy.deleteFromGenericList('Module', MODULE_NAME, {
      parentSelector: '.community-modules-list',
      searchInPlainTableText: true,
      deletedVisible: false,
      waitForDelete: 2000,
      customHeaderText: 'Delete Module',
    });
  });
});
