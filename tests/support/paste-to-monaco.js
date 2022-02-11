Cypress.Commands.add('findMonaco', { prevSubject: false }, () => {
  return cy.getIframeBody().find('div.view-lines');
});

Cypress.Commands.add('pasteToMonaco', { prevSubject: false }, content => {
  cy.log(content);
  cy.findMonaco()
    .clearInput()
    .paste({ pastePayload: content });
  cy.log('done');
});
