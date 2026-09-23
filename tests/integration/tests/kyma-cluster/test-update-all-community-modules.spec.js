/// <reference types="cypress" />

const MODULE_NAME = 'busola';
const OLD_VERSION = '1.0.31';
const NEW_VERSION = '1.0.32';
const OLD_TEMPLATE_NAME = `${MODULE_NAME}-1-0-31`;
const KYMA_SYSTEM_NAMESPACE = 'kyma-system';

context('Test Community Modules update-all functionality', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Install busola module at old version as precondition', () => {
    cy.goToClusterOverview();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.url().should('match', /.*\/kymamodules/);
    cy.get('ui5-dynamic-page.kyma-modules')
      .find('ui5-dynamic-page-title')
      .should('be.visible');

    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .contains('ui5-button', 'Add')
      .click();

    cy.get('ui5-title').contains('Add Community Modules').should('be.visible');

    cy.get('ui5-title').contains(MODULE_NAME).click();

    cy.wait(2000);

    cy.get('[data-testid="create-form-footer-bar"]')
      .contains('ui5-button:visible', 'Add')
      .click();

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
      .find('ui5-button')
      .contains('Update All')
      .should('be.visible');
  });

  it('Opens the update-all dialog when "Update all" is clicked', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-button')
      .contains('Update All')
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
      .contains('Update All')
      .click();

    cy.get('ui5-dialog.update-all-modules-dialog').should('be.visible');

    cy.get('ui5-dialog.update-all-modules-dialog')
      .find('[data-testid="delete-old-template"]')
      .should('be.visible');

    cy.get('ui5-dialog.update-all-modules-dialog')
      .find('[data-testid="delete-old-template"]')
      .find('[type="checkbox"]')
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
      .find('[type="checkbox"]')
      .should('not.be.checked');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button')
      .contains('Cancel')
      .click();

    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-button')
      .contains('Update All')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('[data-testid="delete-old-template"]')
      .find('[type="checkbox"]')
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
      .contains('Update All')
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
      .find('[type="checkbox"]')
      .should('not.be.checked');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button[design="Emphasized"]')
      .click();

    // the toast fades after ~3s but keeps its text; match the message, not visibility
    cy.get('ui5-toast[accessible-name="notification-content"]').should(
      'contain.text',
      'Community Modules updated',
    );

    cy.get('.community-modules-list', { timeout: 15000 })
      .find('ui5-table-row')
      .contains(NEW_VERSION)
      .should('be.visible');

    // Verify the old ModuleTemplate still exists
    cy.goToNamespaceDetails(KYMA_SYSTEM_NAMESPACE);
    cy.navigateTo('Configuration', 'Custom Resources');
    cy.typeInSearch('ModuleTemplates', true);
    cy.clickGenericListLink('ModuleTemplates');

    cy.getMidColumn()
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .should('be.visible')
      .type(OLD_TEMPLATE_NAME, { force: true });

    cy.get('ui5-table-row').contains(OLD_TEMPLATE_NAME).should('be.visible');

    cy.goToClusterOverview();
    cy.get('ui5-card').contains('Modify Modules').click();
  });

  it('Reinstalls old version to prepare for delete-old-templates test', () => {
    cy.inspectTab('Edit');

    cy.contains('ui5-label', MODULE_NAME).should('be.visible');

    // wait for the download, otherwise the panel re-renders and moves the Save button as we click it
    cy.intercept('POST', '**/modules/community-resource').as(
      'resourcesToApply',
    );
    // the save patches the module's Deployment; wait for it before switching tabs, or the reflow detaches the View tab mid-click
    cy.intercept('PATCH', `**/deployments/${MODULE_NAME}`).as('applyModule');

    cy.contains('ui5-label', MODULE_NAME).parent().find('ui5-select').click();

    cy.get('ui5-option:visible').contains(OLD_VERSION).click();

    cy.wait('@resourcesToApply', { timeout: 30000 });

    cy.get('ui5-panel[data-testid="community-modules-edit"]')
      .find('ui5-button')
      .contains('Save')
      .click();

    cy.wait('@applyModule', { timeout: 30000 });

    cy.inspectTab('View');

    // the toast is gone after ~3s, so check the version in the list instead
    cy.get('.community-modules-list', { timeout: 30000 })
      .find('ui5-table-row')
      .contains(OLD_VERSION)
      .should('be.visible');
  });

  it('Confirms update and shows success notification', () => {
    cy.get('ui5-panel[data-testid="community-modules-list"]')
      .find('ui5-button')
      .contains('Update All')
      .click();

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    ).should('be.visible');

    cy.get(
      'ui5-dialog.update-all-modules-dialog, [class*="update-all-modules-dialog"]',
    )
      .find('ui5-button[design="Emphasized"]')
      .click();

    // the toast fades after ~3s but keeps its text; match the message, not visibility
    cy.get('ui5-toast[accessible-name="notification-content"]').should(
      'contain.text',
      'Community Modules updated',
    );
  });

  it('Shows new version in the list after update and verifies old ModuleTemplate was deleted', () => {
    cy.get('.community-modules-list', { timeout: 15000 })
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

    cy.getMidColumn()
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .should('be.visible')
      .type(OLD_TEMPLATE_NAME, { force: true });

    cy.get('ui5-table-row').contains(OLD_TEMPLATE_NAME).should('not.exist');

    cy.goToClusterOverview();
    cy.get('ui5-card').contains('Modify Modules').click();
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
