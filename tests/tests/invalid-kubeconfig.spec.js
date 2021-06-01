/// <reference types="cypress" />
import config from '../config';

context('Invalid kubeconfig', () => {
  it('Use wrong kubeconfig', () => {
    cy.visit(config.clusterAddress);
    cy.get('[data-testid=app-switcher]').click();

    cy.get('[data-testid=addcluster]').click();

    cy.getIframeBody()
      .find('#textarea-kubeconfig')
      .type('wrong_kubeconfig');

    cy.getIframeBody()
      .contains('Apply kubeconfig')
      .click();

    cy.getIframeBody()
      .find('[role=alert][aria-label="invalid-kubeconfig"]')
      .shouldHaveTrimmedText('Error reading kubeconfig');
  });
});
