/// <reference types="cypress" />
import 'cypress-file-upload';

context('Busola - Invalid kubeconfig', () => {
  // before(() => {
  //   cy.restoreURL();
  // });
  it('Use wrong kubeconfig', () => {
    cy.visit(Cypress.env('CLUSTERS_ADDRESS'));
    cy.get('[data-testid=app-switcher]')
      .click()
      .get('[data-testid=addcluster]')
      .click();

    cy.getIframeBody()
      .find('#textarea-kubeconfig')
      .type('wrong_kubeconfig')
      .getIframeBody()
      .contains('Apply kubeconfig')
      .click();

    cy.getIframeBody()
      .find('[role=alert][aria-label="invalid-kubeconfig"]')
      .shouldHaveTrimmedText('Error reading kubeconfig');
  });
});
