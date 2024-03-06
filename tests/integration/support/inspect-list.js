Cypress.Commands.add('inspectList', resourceName => {
  cy.closeMidColumn();

  cy.get('ui5-input[placeholder="Search"]:visible')
    .find('input')
    .type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
