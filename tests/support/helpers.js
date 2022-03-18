export function chooseComboboxOption(selector, optionText) {
  cy.getIframeBody()
    .find(selector)
    .filterWithNoValue()
    .type(optionText);
  cy.getIframeBody()
    .contains(optionText)
    .click();
}

export function deleteFromGenericList(searchTerm, confirmationEnabled = true) {
  cy.getIframeBody()
    .find('[aria-label="open-search"]')
    .click();

  cy.getIframeBody()
    .find('[placeholder="Search"]')
    .type(searchTerm);

  cy.getIframeBody()
    .contains(searchTerm)
    .should('be.visible');

  cy.getIframeBody()
    .find('[aria-label="Delete"]')
    .click();

  if (confirmationEnabled) {
    cy.getIframeBody()
      .contains('button', 'Delete')
      .click({ force: true });

    cy.getIframeBody()
      .contains(/deleted/)
      .should('be.visible');
  }
}
