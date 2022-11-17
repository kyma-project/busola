Cypress.Commands.add('findMonaco', { prevSubject: false }, monacoCount => {
  return cy
    .getIframeBody()
    .find('textarea[aria-roledescription="editor"]:visible')
    .eq(monacoCount);
});

Cypress.Commands.add(
  'pasteToMonaco',
  { prevSubject: false },
  (content, monacoCount) => {
    cy.findMonaco(monacoCount)
      .focus()
      .clearInput()
      .paste({ pastePayload: content });
  },
);
