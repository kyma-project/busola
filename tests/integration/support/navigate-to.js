Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  cy.wait(1500)
    .getLeftNav()
    .get(`ui5-side-navigation-item[text="${leftNav}"]`)
    .as('btn-1')
    .should('be.visible');

  cy.get('@btn-1').click();

  if (resource) {
    cy.getLeftNav()
      .get(`ui5-side-navigation-sub-item[text="${resource}"]`)
      .as('btn-2')
      .should('be.visible');

    cy.get('@btn-2').click();
  }
  cy.wait(500);
});
