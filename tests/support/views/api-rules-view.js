Cypress.Commands.add(
  'createApiRule',
  (ApiRuleName, ApiPort, ApiRuleHostSubdomain) => {
    cy.getLeftNav()
      .get('[title="Discovery and Network"')
      .click();

    cy.getLeftNav()
      .contains('API Rules')
      .click();

    cy.contains('Create API Rule')
      .should('be.visible')
      .click();

    // Name
    cy.get('[ariaLabel="APIRule name"]:visible', { log: false }).type(
      ApiRuleName,
    );

    // Service
    cy.get('[aria-label="Choose Service"]:visible', { log: false })
      .first()
      .type(ApiRuleName);

    cy.get('[aria-label="Choose Service"]:visible', { log: false })
      .first()
      .next()
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    cy.get('[data-testid="spec.service.port"]:visible', { log: false })
      .clear()
      .type(ApiPort);

    // Host
    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type('*');

    cy.get('span', { log: false })
      .contains(/^\*$/i)
      .first()
      .click();

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type('{home}{rightArrow}{backspace}');

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(ApiRuleHostSubdomain);

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .next()
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    // Rules
    // > Methods
    cy.get('[data-testid="spec.rules.0.methods.1"]:visible').type('POST');

    cy.get('[data-testid="spec.rules.0.methods.1"]:visible', { log: false })
      .find('span')
      .find('[aria-label="Combobox input arrow"]:visible', { log: false })
      .click();

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();
  },
);

Cypress.Commands.add('checkApiRuleStatus', ApiRuleName => {
  cy.getLeftNav()
    .contains('Discovery and Network')
    .click();

  cy.getLeftNav()
    .contains('API Rules')
    .click({ force: true });

  cy.get('[aria-label="open-search"]').click();

  cy.get('[aria-label="search-input"]').type(ApiRuleName);

  cy.get('[role="status"]').should('have.text', 'OK');
});
