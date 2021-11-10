Cypress.Commands.add('createApiRule', (ApiRuleName, ApiRuleHost) => {
  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();

  cy.getLeftNav()
    .contains('API Rules')
    .click();

  cy.getIframeBody()
    .contains('Create API Rule')
    .should('be.visible')
    .click();

  cy.getIframeBody()
    .find('[placeholder="API Rule Name"]')
    .filter(':visible', { log: false })
    .type(ApiRuleName);

  cy.getIframeBody()
    .find('[placeholder="Subdomain part of Api Rule address."]')
    .filter(':visible', { log: false })
    .type(ApiRuleHost);

  cy.getIframeBody()
    .contains('Choose the service to expose.')
    .filter(':visible', { log: false })
    .click();
  cy.getIframeBody()
    .contains(ApiRuleName + ' (port: 80)')
    .click();

  cy.getIframeBody()
    .contains('Allow')
    .filter(':visible', { log: false })
    .click();
  cy.getIframeBody()
    .contains('noop')
    .click();

  cy.getIframeBody()
    .contains('POST')
    .click();

  cy.getIframeBody()
    .find('[role=dialog]')
    .contains('button', 'Create')
    .click();
});

Cypress.Commands.add('checkApiRuleStatus', ApiRuleName => {
  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();

  cy.getLeftNav()
    .contains('API Rules')
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
