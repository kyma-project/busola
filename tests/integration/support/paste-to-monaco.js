Cypress.Commands.add(
  'findMonaco',
  { prevSubject: false },
  (monacoCount = 0) => {
    return cy
      .get('div.monaco-editor')
      .find('textarea[aria-roledescription="editor"]:visible')
      .eq(monacoCount);
  },
);

Cypress.Commands.add(
  'pasteToMonaco',
  { prevSubject: false },
  (content, monacoCount) => {
    // Ignore Cypress issue with Monaco on CI
    cy.handleExceptions();

    cy.findMonaco(monacoCount).should('be.visible');

    cy.wait(1000);

    cy.findMonaco(monacoCount).click({ force: true });

    cy.findMonaco(monacoCount)
      .should('have.focus')
      .clearInput()
      .paste({ pastePayload: content });
  },
);
