/// <reference types="cypress" />
import config from '../config';

context('Invalid kubeconfig', () => {
  it('Use wrong kubeconfig - textfield', () => {
    cy.visit(`${config.clusterAddress}/clusters`);
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

  it('Use wrong kubeconfig - from file', () => {
    cy.visit(`${config.clusterAddress}/clusters`);
    cy.get('[data-testid=app-switcher]').click();

    cy.get('[data-testid=addcluster]').click();

    cy.getIframeBody()
      .contains('Drag file here')
      .attachFile('kubeconfig--invalid.txt', { subjectType: 'drag-n-drop' });

    cy.getIframeBody()
      .find('[role=alert][aria-label="invalid-kubeconfig"]')
      .shouldHaveTrimmedText('Error reading kubeconfig');
  });
});
