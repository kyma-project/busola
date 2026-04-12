context('Test Update Community Module', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.get('ui5-card').contains('Modify Modules').click();
    cy.url().should('match', /.*\/kymamodules/);
  });

  it('Install community module busola v0.0.11 as prerequisite', () => {
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
      .type(
        'https://raw.githubusercontent.com/kyma-project/busola/refs/heads/main/tests/integration/fixtures/community-modules/busola-0-11.yaml',
      );

    cy.wait(1000);

    cy.get('ui5-button:visible').contains('Add').click();

    cy.wait(1000);

    cy.get('ui5-card').contains('busola').should('be.visible');

    cy.get('ui5-title').contains('busola').click();

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
      .type('busola');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('busola')
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('0.0.11')
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

    cy.get('.update-module-dialog').contains('busola').should('be.visible');

    cy.get('.update-module-dialog')
      .contains('Current version: 0.0.11')
      .should('be.visible');

    cy.get('.update-module-dialog')
      .contains('Latest version: 0.0.12')
      .should('be.visible');

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .should('be.visible')
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
      .contains('0.0.11')
      .should('be.visible');
  });

  it('Checkbox resets to checked each time the dialog is reopened', () => {
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .click();

    // Uncheck it
    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .click();

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .should('not.be.checked');

    cy.get('.update-module-dialog')
      .find('ui5-button')
      .contains('Cancel')
      .click();

    // Reopen — should be checked again
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .click();

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
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

    // Uncheck to keep old templates
    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
      .click();

    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
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
      .contains('busola')
      .should('be.visible');

    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('0.0.12')
      .should('be.visible');

    // No more update available
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .should('not.exist');
  });

  it('Cleans up: reinstall v0.0.11 to prepare for delete-old-templates test', () => {
    cy.inspectTab('Edit');

    cy.wait(1000);

    cy.contains('ui5-label', 'busola').should('be.visible');

    cy.contains('ui5-label', 'busola').parent().find('ui5-select').click();

    cy.wait(500);

    cy.get('ui5-option:visible').contains('0.0.11').click();

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

    // Checkbox is checked by default
    cy.get('.update-module-dialog')
      .find('[data-testid="delete-old-template"]')
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
      .contains('0.0.12')
      .should('be.visible');

    // No more update available — old templates were deleted
    cy.get('.community-modules-list')
      .find('ui5-table-row')
      .contains('ui5-button', 'Update')
      .should('not.exist');
  });

  it('Cleans up the installed module', () => {
    cy.deleteFromGenericList('Module', 'busola', {
      parentSelector: '.community-modules-list',
      searchInPlainTableText: true,
      deletedVisible: false,
      waitForDelete: 2000,
      customHeaderText: 'Delete Module',
    });
  });
});
