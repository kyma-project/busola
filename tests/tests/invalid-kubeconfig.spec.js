/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';

context('Invalid kubeconfig', () => {
  it('Use wrong kubeconfig - textfield', () => {
    cy.visit(config.clusterAddress);
    cy.get('[data-testid=app-switcher]')
      .click()
      .get('[data-testid=addcluster]')
      .click();

    cy.getIframeBody()
      .contains('Paste')
      .click();

    cy.getIframeBody()
      .find('#textarea-kubeconfig')
      .type('wrong_kubeconfig')
      .getIframeBody()
      .contains('Apply configuration')
      .should('be.disabled');

    cy.getIframeBody()
      .find('[role=alert][aria-label="invalid-kubeconfig"]')
      .shouldHaveTrimmedText('Error reading kubeconfig');
  });

  it('Use wrong kubeconfig - from file', () => {
    cy.visit(config.clusterAddress);
    cy.get('[data-testid=app-switcher]')
      .click()
      .get('[data-testid=addcluster]')
      .click();

    cy.getIframeBody()
      .contains('Drag file here')
      .attachFile('kubeconfig--invalid.txt', { subjectType: 'drag-n-drop' });

    cy.getIframeBody()
      .contains('Apply configuration')
      .should('be.disabled');

    cy.getIframeBody()
      .find('[role=alert][aria-label="invalid-kubeconfig"]')
      .shouldHaveTrimmedText('Error reading kubeconfig');
  });
});
