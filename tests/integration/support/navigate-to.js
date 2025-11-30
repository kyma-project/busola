Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  cy.wait(1500)
    .getLeftNav()
    .get(`ui5-side-navigation-item[text="${leftNav}"]`)
    .should('be.visible')
    .click();

  if (resource) {
    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="${resource}"]`)
      .should('be.visible')
      .click();
  }
  cy.wait(1500);
});
