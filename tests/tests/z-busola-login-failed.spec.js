/// <reference types="cypress" />
import 'cypress-file-upload';

context.skip('Busola - Login failed', () => {
  it('Use wrong kubeconfig', () => {
    cy.get('[data-testid=app-switcher]')
      .click()
      .get('[data-testid=addcluster]')
      .click();

    cy.wait(2000);
    cy.getIframeBody()
      .find('#textarea-kubeconfig')
      .type('wrong_kubeconfig')
      .getIframeBody()
      .contains('Apply kubeconfig')
      .click();

    cy.wait(2000);
    cy.getIframeBody()
      .find('[role=alert]')
      .shouldHaveTrimmedText('Error reading kubeconfig');
  });
});
