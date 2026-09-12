Cypress.Commands.add('openCreate', () => {
  cy.get('ui5-panel').contains('ui5-button', 'Create').click();
  cy.get('[data-testid="create-form-footer-bar"]').should('be.visible');
  // fields render only after the schema loads (async for extension forms); wait for body content
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
  // an edit keeps the form mounted and a no-op sends no request, so there is no signal to wait on
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
