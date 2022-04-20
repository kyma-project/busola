Cypress.Commands.add('createSimpleFunction', functionName => {
  cy.getLeftNav()
    .contains('Functions')
    .click();

  cy.getIframeBody()
    .contains('Create Function')
    .click();

  cy.getIframeBody()
    .contains('Advanced')
    .click();

  cy.getIframeBody()
    .find('.advanced-form')
    .find('[ariaLabel="Function name"]')
    .should('have.text', '')
    .type(functionName);

  cy.getIframeBody()
    .find('.advanced-form')
    .contains('Labels')
    .click();

  cy.getIframeBody()
    .find('[placeholder="Enter key"]')
    .last()
    .type(`example{enter}${functionName}`);

  cy.getIframeBody()
    .contains('label', 'Labels')
    .click();

  cy.getIframeBody()
    .find('[role="dialog"]')
    .contains('button', 'Create')
    .click();
});

Cypress.Commands.add(
  'createFunction',
  (functionName, functionPath, dependenciesPath) => {
    cy.createSimpleFunction(functionName);

    cy.readFile(functionPath).then(body => {
      cy.pasteToMonaco(body);
    });

    cy.getIframeBody()
      .find('[aria-controls="function-dependencies"]')
      .click();

    cy.readFile(dependenciesPath).then(body => {
      cy.pasteToMonaco(JSON.stringify(body));
    });

    cy.getIframeBody()
      .find('.function-details')
      .contains('button', 'Save')
      .should('not.be.disabled')
      .click();
  },
);
