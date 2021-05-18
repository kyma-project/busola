/// <reference types="cypress" />
import config from '../config';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

context('Busola - Login failed', () => {
  it('Use wrong kubeconfig', () => {
    cy.restoreLocalStorageCache();
    cy.visit(ADDRESS)
      .getIframeBody()
      .contains('Add Cluster')
      .click()
      .getIframeBody()
      .find('#textarea-kubeconfig')
      .type('wrong_kubeconfig')
      .getIframeBody()
      .contains('Apply kubeconfig')
      .click();

    cy.getIframeBody()
      .find('[role=alert]')
      .shouldHaveTrimmedText('Error reading kubeconfig');
  });
});
