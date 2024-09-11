const { chooseComboboxOption } = require('../../support/helpers');

const KYMA_NAME = `test-kyma-${Math.floor(Math.random() * 9999) + 1000}`;
const KYMA_DEFAULT_CHANNEL = 'fast';
context('Test Kyma', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create an Kyma', () => {
    cy.wait(600);

    cy.getLeftNav()
      .contains('Kyma')
      .click();

    cy.getLeftNav()
      .get('[aria-level="2"]')
      .contains('Kyma')
      .click();

    cy.openCreate();

    cy.get('ui5-dialog')
      .find('[aria-label="Kyma name"]:visible')
      .find('input')
      .click()
      .type(KYMA_NAME, { force: true });

    chooseComboboxOption('[data-testid="spec.channel"]', KYMA_DEFAULT_CHANNEL);

    cy.contains('keda');

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Inspect Kyma', () => {
    cy.contains(KYMA_NAME);
  });

  it('Edit a Kyma', () => {
    cy.contains('ui5-button', 'Edit').click();

    cy.get(`ui5-checkbox[text="keda"]`).click();

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();
  });

  it('Inspect updated Kyma', () => {
    cy.contains(KYMA_NAME);
    cy.contains('keda');
  });

  it('Inspect Kyma list', () => {
    cy.inspectList('Kyma', KYMA_NAME);
  });
});
