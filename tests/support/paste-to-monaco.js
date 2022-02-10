Cypress.Commands.add('findMonaco', { prevSubject: true }, element => {
  return cy
    .wrap(element)
    .find('textarea[aria-roledescription="editor"]:visible');
});

Cypress.Commands.add('pasteToMonaco', { prevSubject: true }, content => {
  console.log(content);
  cy.findMonaco()
    .clearInput()
    .paste({ pastePayload: content });
});
