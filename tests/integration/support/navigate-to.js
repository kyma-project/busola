Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  cy.getLeftNav()
    .get(`ui5-side-navigation-item[text="${leftNav}"]`)
    .should('be.visible')
    .click();

  cy.getLeftNav()
    .get(`ui5-side-navigation-sub-item[text="${resource}"]`)
    .should('be.visible')
    .click();
});
