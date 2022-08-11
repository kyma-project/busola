Cypress.Commands.add('createNamespace', namespaceName => {
  cy.log('Create a Namespace');

  cy.getLeftNav()
    .contains('Namespaces')
    .click();

  cy.getIframeBody()
    .contains('button', 'Create Namespace')
    .click();

  cy.getIframeBody()
    .find('input[ariaLabel="Namespace name"]:visible')
    .type(namespaceName);

  cy.getIframeBody()
    .find('[role=dialog]')
    .contains('button', 'Create')
    .click();

  cy.getIframeBody()
    .contains('h3', namespaceName)
    .should('be.visible');
});
