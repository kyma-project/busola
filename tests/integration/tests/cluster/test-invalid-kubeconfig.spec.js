/// <reference types="cypress" />
import config from '../../config';

context('Test invalid kubeconfig', () => {
  Cypress.skipAfterFail();

  it('Use wrong kubeconfig - textfield', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .contains('Connect cluster')
      .click();

    cy.pasteToMonaco('wrong_kubeconfig');

    // trigger blur on editor
    cy.contains('Cancel').focus();

    cy.get('ui5-message-strip[design="Negative"]').shouldHaveTrimmedText(
      'Parse error: kubeconfig is not an object, previous valid input will be used',
    );
  });

  it('Use wrong kubeconfig - from file', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .contains('Connect cluster')
      .click();

    cy.contains(
      'Drag your file here or click to upload',
    ).attachFile('kubeconfig--invalid.txt', { subjectType: 'drag-n-drop' });

    cy.get('ui5-message-strip[design="Negative"]').should(
      'contain.text',
      'Parse error: bad indentation of a mapping entry',
    );
  });
});
