Cypress.Commands.add('inspectList', resourceName => {
  cy.closeMidColumn();

  cy.get('ui5-input[placeholder="Search"]:visible')
    .find('input')
    .click()
    .type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
