Cypress.Commands.add('createApiRule', (ApiRuleName, ApiRuleHost) => {
  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();

  cy.getLeftNav()
    .contains('API Rules')
    .click();

  cy.getIframeBody()
    .contains('Create apirules')
    .click();

  cy.getModalBody().within($modal => {
    cy.get('[placeholder="API Rule name"]').type(ApiRuleName);
    cy.get('[placeholder="Enter the hostname"]').type(ApiRuleHost); //the host is ocupied by another virtualservice
    cy.get('[role="select"]#service').select(ApiRuleName + ':80');

    cy.get('[aria-label="Access strategy type"]').select('noop');

    // inputs are invisible because the Fundamental uses label::before to display the check area
    cy.get('input[type="checkbox"]').check(['GET', 'POST'], { force: true });
    cy.get('input[type="checkbox"]').uncheck(
      ['PUT', 'PATCH', 'DELETE', 'HEAD'],
      { force: true },
    );
    cy.get('[aria-label="submit-form"]')
      .should('not.be.disabled')
      .click();
  });

  cy.getModalBody().should('not.exist');

  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();
});
