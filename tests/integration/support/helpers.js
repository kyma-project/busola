export function chooseComboboxOption(selector, optionText, force = false) {
  cy.get(`ui5-combobox${selector}`)
    .find('input')
    .filterWithNoValue()
    .as('comboboxInput')
    .click();
  cy.get('@comboboxInput').type(optionText);

  cy.get('ui5-cb-item:visible').contains(optionText).click({ force: force });

  return cy.end();
}

export function useCategory(category) {
  before(() => {
    cy.getLeftNav().contains(category).click();
  });

  after(() => {
    cy.getLeftNav().contains(category).click();
  });
}
