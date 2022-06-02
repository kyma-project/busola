/// <reference types="cypress" />
import config from '../../config';

context('Test invalid kubeconfig', () => {
  Cypress.skipAfterFail();

  it('Use wrong kubeconfig - textfield', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .getIframeBody()
      .contains('Connect cluster')
      .click();

    cy.pasteToMonaco('wrong_kubeconfig');

    // trigger blur on editor
    cy.getIframeBody()
      .contains('Cancel')
      .focus();

    cy.getIframeBody()
      .find('.fd-message-strip--error')
      .shouldHaveTrimmedText(
        'Parse error: kubeconfig is not an object, previous valid input will be used',
      );
  });

  it('Use wrong kubeconfig - from file', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .getIframeBody()
      .contains('Connect cluster')
      .click();

    cy.getIframeBody()
      .contains('Drag your file here or click to upload')
      .attachFile('kubeconfig--invalid.txt', { subjectType: 'drag-n-drop' });

    cy.getIframeBody()
      .find('.fd-message-strip--error')
      .should(
        'contain.text',
        'Parse error: bad indentation of a mapping entry',
      );
  });
});
