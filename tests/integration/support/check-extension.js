Cypress.Commands.add('checkExtension', (resource, create = true) => {
  // To check and probably remove after cypress bump
  cy.wait(500);

  cy.getLeftNav()
    .contains(resource)
    .should('be.visible');

  cy.getLeftNav()
    .contains(resource)
    .click();

  cy.contains('ui5-title', resource).should('be.visible');

  if (create) {
    cy.contains('ui5-button', 'Create').should('be.visible');
  }
});
