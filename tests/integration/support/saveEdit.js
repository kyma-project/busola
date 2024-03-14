Cypress.Commands.add('saveEdit', () => {
  cy.get('.edit-form')
    .find('.header-actions')
    .contains('ui5-button:visible', 'Save')
    .click();
});
