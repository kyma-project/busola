Cypress.Commands.add('createApiRule', (ApiRuleName, ApiPort, ApiRuleHost) => {
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

  // Name
  cy.getIframeBody()
    .find('[ariaLabel="APIRule name"]:visible', { log: false })
    .type(ApiRuleName);

  // Service
  cy.getIframeBody()
    .find('[aria-label="expand Service"]:visible', { log: false })
    .click();

  cy.getIframeBody()
    .find('[aria-label="Choose Service"]:visible', { log: false })
    .first()
    .type(ApiRuleName);

  cy.getIframeBody()
    .find('[placeholder="Enter the port number"]:visible', { log: false })
    .clear()
    .type(ApiPort);

  // Host
  cy.getIframeBody()
    .find('[aria-label="Combobox input"]:visible', { log: false })
    .first()
    .type(ApiRuleHost);

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
    .click({ force: true });

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
