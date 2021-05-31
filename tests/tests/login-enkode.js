/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { generateParams, generateParams2 } from '../support/enkode';

context('Login - enkode link', () => {
  it('Unmodified kubeconfig', () => {
    cy.wrap(generateParams()).then(params => {
      cy.visit(`${config.clusterAddress}?init=${params}`);

      cy.url().should('match', /namespaces$/);
      cy.getIframeBody()
        .find('thead')
        .should('be.visible');
    });
  });

  it('Only params from enkode, upload kubeconfig manually', () => {
    cy.wrap(generateParams2()).then(params => {
      cy.visit(`${config.clusterAddress}?init=${params}`);

      cy.getIframeBody()
        .contains(
          'Configuration has been included properly. Please fill remaining required data.',
        )
        .should('be.visible');

      cy.getIframeBody()
        .contains('Drag file here')
        .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

      cy.getIframeBody()
        .contains('Apply configuration')
        .click();

      cy.url().should('match', /namespaces$/);

      cy.getLeftNav()
        .contains('Testing Busola')
        .click();

      cy.getLeftNav()
        .contains('Test nav node')
        .should('be.visible');
    });
  });
});
