/// <reference types="cypress" />
import 'cypress-file-upload';

context('Busola - Invalid kubeconfig', () => {
  it('Use wrong kubeconfig', () => {
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
