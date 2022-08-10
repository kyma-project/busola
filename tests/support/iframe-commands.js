Cypress.Commands.add('getIframeBody', () => {
  // get the iframe > document > body
  // and retry until the body element is not empty
  cy.log('getIframeBody');
  cy.get('[luigi-app-loading-indicator=""]').should('not.exist');
  return (
    cy
      .get('.iframeContainer iframe', { log: false })
      .should('be.visible', { log: false })
      .its('0.contentDocument.body', { log: false })
      .should('not.be.empty', { log: false })
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      // https://on.cypress.io/wrap
      .then(body => cy.wrap(body, { log: false }))
  );
});

Cypress.Commands.add('getModalIframeBody', () => {
  // get the iframe > document > body
  // and retry until the body element is not empty
  cy.log('getModalIframeBody');

  return (
    cy
      .get('.iframeModalCtn iframe', { log: false })
      .filter(':visible', { log: false })
      .its('0.contentDocument.body', { log: false })
      .should('not.be.empty', { log: false })
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      // https://on.cypress.io/wrap
      .then(body => cy.wrap(body, { log: false }))
  );
});
