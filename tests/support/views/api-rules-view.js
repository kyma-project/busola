Cypress.Commands.add('createApiRule', (ApiRuleName, ApiRuleHost) => {
  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();

  cy.getLeftNav()
    .contains('APIRules')
    .click();

  cy.getIframeBody()
    .contains('Create API Rules')
    .should('be.visible')
    .click();

  cy.getModalBody().within($modal => {
    cy.get('[placeholder="API Rule name"]').type(ApiRuleName);
    cy.get('[placeholder="Enter the hostname"]').type(ApiRuleHost); //the host is ocupied by another virtualservice
    cy.get('[data-testid=service]').click();
    cy.get('li[role="option"]')
      .contains(ApiRuleName + ' (port: 80)')
      .click({ force: true });

    cy.get('[data-testid="access-strategies-dropdown"]').click();
    cy.get('li[role="option"]')
      .contains('noop')
      .click({ force: true });

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

  cy.get('.iframeModalCtn iframe').should('not.exist');

  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();
});

Cypress.Commands.add('checkApiRuleStatus', ApiRuleName => {
  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();

  cy.getLeftNav()
    .contains('APIRules')
    .click();

  cy.getIframeBody()
    .find('[aria-label="open-search"]')
    .click();

  cy.getIframeBody()
    .find('[aria-label="search-input"]')
    .type(ApiRuleName);

  cy.getIframeBody()
    .find('[role="status"]')
    .should('have.text', 'OK');
});
