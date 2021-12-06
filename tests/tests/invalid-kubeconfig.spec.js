/// <reference types="cypress" />
import config from '../config';

context('Invalid kubeconfig', () => {
  it('Use wrong kubeconfig - textfield', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .getIframeBody()
      .contains('Connect a cluster')
      .click();

    cy.getIframeBody()
      .find('.monaco-editor')
      .type('wrong_kubeconfig');

    // trigger blur on editor
    cy.getIframeBody()
      .contains('Cancel')
      .focus();

    cy.getIframeBody()
      .find('.fd-message-strip--error')
      .shouldHaveTrimmedText(
        'Parse error: kubeconfig is not an object, previous valid input will be used.',
      );
  });

  it('Use wrong kubeconfig - from file', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .getIframeBody()
      .contains('Connect a cluster')
      .click();

    cy.getIframeBody()
      .contains('Drag file here')
      .attachFile('kubeconfig--invalid.txt', { subjectType: 'drag-n-drop' });

    cy.getIframeBody()
      .find('.fd-message-strip--error')
      .shouldHaveTrimmedText(
        'Parse error: bad indentation of a mapping entry (2:2), previous valid input will be used.',
      );
  });
});
