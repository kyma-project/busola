Cypress.Commands.add('findMonaco', { prevSubject: false }, () => {
  return cy
    .getIframeBody()
    .find('textarea[aria-roledescription="editor"]:visible');
});

Cypress.Commands.add('pasteToMonaco', { prevSubject: false }, content => {
  cy.log(content);
  cy.findMonaco()
    .clearInput()
    .paste({ pastePayload: content });
  cy.log('done');
});
