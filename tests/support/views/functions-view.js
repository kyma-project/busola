Cypress.Commands.add('navigateToFunctionCreate', functionName => {
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
    .type(functionName);
});

Cypress.Commands.add('createSimpleFunction', functionName => {
  cy.getLeftNav()
    .contains('Workloads')
    .click();

  cy.navigateToFunctionCreate(functionName);

  cy.getIframeBody()
    .find('[role="dialog"]')
    .contains('button', 'Create')
    .click();
});

Cypress.Commands.add(
  'createFunction',
  (functionName, functionPath, dependenciesPath) => {
    cy.navigateToFunctionCreate(functionName);

    //paste code to the Source Tab code editor
    cy.getIframeBody()
      .find('[aria-label="expand Source"]')
      .readFile(functionPath)
      .then(body => {
        cy.pasteToMonaco(body, 0);
      });

    //open Dependencies Tab and paste the dependencies to the code editor
    cy.getIframeBody()
      .find('[aria-label="expand Dependencies"]')
      .readFile(dependenciesPath)
      .then(body => {
        cy.pasteToMonaco(JSON.stringify(body), 1);
      });

    // click Create button
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();

    //check whether Function has been created
    cy.getIframeBody().contains('button', 'Edit');
  },
);
