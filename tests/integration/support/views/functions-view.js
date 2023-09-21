Cypress.Commands.add('navigateToFunctionCreate', functionName => {
  cy.getLeftNav()
    .contains('Functions')
    .click();

  cy.contains('Create Function').click();

  cy.contains('Advanced').click();

  cy.get('.advanced-form')
    .find('[ariaLabel="Function name"]')
    .type(functionName);
});

Cypress.Commands.add('createSimpleFunction', functionName => {
  cy.getLeftNav()
    .contains('Workloads')
    .click();

  cy.navigateToFunctionCreate(functionName);

  cy.get('[role="dialog"]')
    .contains('button', 'Create')
    .click();
});

Cypress.Commands.add(
  'createFunction',
  (functionName, functionPath, dependenciesPath) => {
    cy.navigateToFunctionCreate(functionName);

    //paste code to the Source Tab code editor
    cy.get('[aria-label="expand Source"]')
      .readFile(functionPath)
      .then(body => {
        cy.pasteToMonaco(body);
      });

    //open Dependencies Tab and paste the dependencies to the code editor
    cy.get('[aria-label="expand Dependencies"]')
      .click()
      .readFile(dependenciesPath)
      .then(body => {
        cy.pasteToMonaco(JSON.stringify(body), 1);
      });

    // click Create button
    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();

    //check whether Function has been created
    cy.contains('button', 'Edit');
  },
);
