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
    Cypress.on('uncaught:exception', err => {
      if (err.message.includes('Unexpected usage')) return false;
    });

    cy.findMonaco(monacoCount)
      .focus()
      .clearInput()
      .paste({ pastePayload: content });
  },
);
