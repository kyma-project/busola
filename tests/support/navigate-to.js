Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  cy.getLeftNav()
    .contains(leftNav)
    .click();

  cy.getLeftNav()
    .contains(resource)
    .click();
});
