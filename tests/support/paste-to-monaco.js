Cypress.Commands.add(
  'findMonaco',
  { prevSubject: false },
  (monacoCount = 0) => {
    return cy
      .get('textarea[aria-roledescription="editor"]:visible')
      .eq(monacoCount);
  },
);

Cypress.Commands.add(
  'pasteToMonaco',
  { prevSubject: false },
  (content, monacoCount) => {
    // Ignor Cypress issue with Monaco on CI
    cy.handleExceptions();

    cy.findMonaco(monacoCount)
      .focus()
      .clearInput()
      .paste({ pastePayload: content });
  },
);
