Cypress.Commands.add('inspectList', (resource, resourceName) => {
  //cy.contains('[aria-label="breadcrumb-item"]', resource).click();
  //resource = resource.trim().toLowerCase();

  cy.get('ui5-breadcrumbs')
    .shadow()
    .find('ui5-link')
    .should('have.attr', 'href')
    .and('include', resource)
    .shadow()
    .find('a')
    .should('have.attr', 'href')
    .and('include', resource)
    .should('be.visible')
    .click({ force: true });

  cy.get('[role="search"] [aria-label="open-search"]').type(resourceName);

  cy.contains(resourceName).should('be.visible');
});
