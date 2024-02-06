/// <reference types="cypress" />
import config from '../../config';

context('Test invalid kubeconfig', () => {
  Cypress.skipAfterFail();

  it('Use wrong kubeconfig - textfield', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .get('ui5-button:visible')
      .contains('Connect')
      .click();

    cy.pasteToMonaco('wrong_kubeconfig');

    // trigger blur on editor
    cy.get('[aria-label="cancel"]')
      .should('contain.text', 'Cancel')
      .should('be.visible');

    cy.get('ui5-message-strip[design="Negative"]').shouldHaveTrimmedText(
      'Parse error: An object is required, previous valid input will be used',
    );
  });

  it('Use wrong kubeconfig - from file', () => {
    cy.visit(`${config.clusterAddress}/clusters`)
      .get('ui5-button:visible')
      .contains('Connect')
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
