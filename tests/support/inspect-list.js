Cypress.Commands.add('inspectList', (resource, resourceName) => {
  cy.getIframeBody()
    .contains('a', resource)
    .click();

  cy.getIframeBody()
    .find('[role="search"] [aria-label="open-search"]')
    .type(resourceName);

  cy.getIframeBody()
    .contains(resourceName)
    .should('be.visible');
});
