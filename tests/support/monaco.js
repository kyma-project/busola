Cypress.Commands.add('findMonaco', { prevSubject: true }, element => {
  cy.wrap(element).find('textarea[aria-roledescription="editor"]:visible');
});

Cypress.Commands.add('pasteToMonaco', { prevSubject: true }, content => {
  cy.findMonaco();
  cy.clearInput();
  cy.paste({ pastePayload: content });
});
