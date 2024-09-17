Cypress.Commands.add('navigateBackTo', (resourceUrl, resourceName) => {
  cy.get('ui5-breadcrumbs')
    .find(`ui5-link[href*=${resourceUrl}]`)
    .should('contain.text', resourceName)
    .find(`a[href*=${resourceUrl}]`)
    .click({ force: true });
});
