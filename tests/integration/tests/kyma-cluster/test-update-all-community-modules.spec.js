/// <reference types="cypress" />

const MODULE_NAME = 'busola';
const OLD_VERSION = '0.0.11';
const NEW_VERSION = '0.0.12';
const OLD_FIXTURE_URL =
  'https://raw.githubusercontent.com/kyma-project/busola/refs/heads/main/tests/integration/fixtures/community-modules/busola-0-11.yaml';
const OLD_TEMPLATE_NAME = `${MODULE_NAME}-0-11`;
const KYMA_SYSTEM_NAMESPACE = 'kyma-system';

context('Test Community Modules update-all functionality', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Install busola module at old version as precondition', () => {
    cy.getLeftNav().contains('Cluster Overview').click();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.url().should('match', /.*\/kymamodules/);

    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Add')
      .click();

    cy.wait(1000);
    cy.get('ui5-title').contains('Add Community Modules').should('be.visible');

    cy.get('ui5-title').contains(MODULE_NAME).click();

    cy.wait(2000);

    cy.get('[data-testid="create-form-footer-bar"]')
      .contains('ui5-button:visible', 'Add')
      .click();

    cy.wait(2000);

    cy.inspectTab('View');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(MODULE_NAME)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(OLD_VERSION)
      .should('be.visible');
  });

  it('"Update all" button is visible when an update is available', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Update all')
      .should('be.visible');
  });

  it('Opens the update-all dialog when "Update all" is clicked', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Update all')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    ).should('be.visible');
  });

  it('Shows the module name and both versions in the dialog table', () => {
    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .contains(MODULE_NAME)
      .should('be.visible');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .contains(OLD_VERSION)
      .should('be.visible');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .contains(NEW_VERSION)
      .should('be.visible');
  });

  it('Closes the dialog without updating when Cancel is clicked', () => {
    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button')
      .contains('Cancel')
      .click();

    cy.get('ui5-dialog.update-all-modules-dialog').should('not.exist');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(OLD_VERSION)
      .should('be.visible');
  });

  it('Delete checkbox is checked by default in the dialog', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-button')
      .contains('Update all')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    ).should('be.visible');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('[data-testid="delete-old-template"]')
      .should('be.visible')
      .should('be.checked');
  });

  it('Delete checkbox resets to checked each time the dialog is reopened', () => {
    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('[data-testid="delete-old-template"]')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('[data-testid="delete-old-template"]')
      .should('not.be.checked');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button')
      .contains('Cancel')
      .click();

    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-button')
      .contains('Update all')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('[data-testid="delete-old-template"]')
      .should('be.checked');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button')
      .contains('Cancel')
      .click();
  });

  it('Confirms update without deleting old ModuleTemplates when checkbox is unchecked', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-button')
      .contains('Update all')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    ).should('be.visible');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('[data-testid="delete-old-template"]')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('[data-testid="delete-old-template"]')
      .should('not.be.checked');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button[design="Emphasized"]')
      .click();

    cy.contains('module-update-started').should('be.visible');

    cy.wait(3000);

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(NEW_VERSION)
      .should('be.visible');

    // Verify the old ModuleTemplate still exists
    cy.goToNamespaceDetails(KYMA_SYSTEM_NAMESPACE);
    cy.navigateTo('Configuration', 'Custom Resources');
    cy.typeInSearch('ModuleTemplates', true);
    cy.clickGenericListLink('ModuleTemplates');
    cy.typeInSearch(OLD_TEMPLATE_NAME, true);
    cy.get('ui5-table-row').contains(OLD_TEMPLATE_NAME).should('be.visible');

    cy.getLeftNav().contains('Cluster Overview').click();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.inspectTab('View');
  });

  it('Reinstalls old version to prepare for delete-old-templates test', () => {
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

  it('Confirms update and shows success notification', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-button')
      .contains('Update all')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    ).should('be.visible');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button[design="Emphasized"]')
      .click();

    cy.contains('module-update-started').should('be.visible');
  });

  it('Shows new version in the list after update and verifies old ModuleTemplate was deleted', () => {
    cy.wait(2000);

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(MODULE_NAME)
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains(NEW_VERSION)
      .should('be.visible');

    // Verify the old ModuleTemplate was deleted
    cy.goToNamespaceDetails(KYMA_SYSTEM_NAMESPACE);
    cy.navigateTo('Configuration', 'Custom Resources');
    cy.typeInSearch('ModuleTemplates', true);
    cy.clickGenericListLink('ModuleTemplates');
    cy.typeInSearch(OLD_TEMPLATE_NAME, true);
    cy.get('ui5-table-row').contains(OLD_TEMPLATE_NAME).should('not.exist');

    cy.getLeftNav().contains('Cluster Overview').click();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.inspectTab('View');
  });

  it('Cleans up — deletes the installed busola module', () => {
    cy.deleteFromGenericList('Module', MODULE_NAME, {
      parentSelector: '.community-modules-list',
      searchInPlainTableText: true,
      deletedVisible: false,
      waitForDelete: 2000,
      customHeaderText: 'Delete Module',
    });
  });
});
