Cypress.Commands.add('openCreate', () => {
  cy.get('ui5-panel').contains('ui5-button', 'Create').click();
  cy.get('[data-testid="create-form-footer-bar"]').should('be.visible');
  // the footer mounts together with the form shell, but the fields inside render
  // only once the resource template/schema has loaded - extension forms fetch it
  // async, so wait for the body to actually have content before callers touch it
  cy.get('.create-form')
    .find(
      'ui5-input, ui5-combobox, ui5-select, ui5-multi-input, ui5-textarea, ui5-switch, ui5-checkbox, div.monaco-editor',
    )
    .should('exist');
});

Cypress.Commands.add('saveChanges', (action = 'Create') => {
  const isCreate = action === 'Create';
  cy.get(isCreate ? '[data-testid="create-form-footer-bar"]' : '.edit-form')
    .contains('ui5-button:visible', isCreate ? 'Create' : 'Save')
    .click();

  if (isCreate) {
    // a successful create navigates away and unmounts the form footer
    cy.get('[data-testid="create-form-footer-bar"]', { timeout: 30000 }).should(
      'not.exist',
    );
  }
  // an edit keeps the form mounted and a no-op edit sends no request at all, so
  // there is no reliable signal here; callers assert the edited value themselves
});

Cypress.Commands.add('checkUnsavedDialog', () => {
  cy.wait(500);
  cy.getLeftNav().contains('Events').click();

  cy.get('ui5-dialog[header-text="Discard Changes"]').should('be.visible');

  cy.get('ui5-dialog[header-text="Discard Changes"]:visible')
    .find('ui5-button')
    .contains('Cancel')
    .click();

  cy.go('back');

  cy.get('ui5-dialog[header-text="Discard Changes"]:visible')
    .find('ui5-button')
    .contains('Cancel')
    .click();
});
