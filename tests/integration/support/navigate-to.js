Cypress.Commands.add('navigateTo', (leftNav, resource) => {
  cy.getLeftNav()
    .contains(leftNav, { includeShadowDom: true })
    .should('be.visible');

  cy.getLeftNav()
    .contains(leftNav, { includeShadowDom: true })
    .click();

  cy.getLeftNav()
    .contains(resource, { includeShadowDom: true })
    .click();
});
