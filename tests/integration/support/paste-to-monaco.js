Cypress.Commands.add(
  'findMonaco',
  { prevSubject: false },
  (monacoCount = 0) => {
    return cy
      .get('div.monaco-editor')
      .find('textarea[aria-roledescription="editor"]')
      .eq(monacoCount)
      .focus();
  },
);

Cypress.Commands.add(
  'pasteToMonaco',
  { prevSubject: false },
  (content, monacoCount) => {
    // Ignore Cypress issue with Monaco on CI
    cy.handleExceptions();
    cy.wait(1000);

    cy.findMonaco(monacoCount).then(monaco => {
      if (monaco.is(':visible')) {
        monaco.click({ force: true });
      }
    });

    cy.findMonaco(monacoCount).then(monaco => {
      if (monaco.is(':visible')) {
        monaco
          .should('have.focus')
          .clearInput()
          .paste({ pastePayload: content });
      }
    });
  },
);
