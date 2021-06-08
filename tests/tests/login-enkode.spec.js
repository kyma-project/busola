/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import {
  generateDefaultParams,
  generateParamsWithNamespace,
  generateParamsWithNoKubeconfig,
  generateParamsAndToken,
} from '../support/enkode';

context('Login - enkode link', () => {
  it('Unmodified kubeconfig', () => {
    cy.wrap(generateDefaultParams()).then(params => {
      cy.visit(`${config.clusterAddress}?init=${params}`);

      cy.url().should('match', /namespaces$/);
      cy.getIframeBody()
        .find('thead')
        .should('be.visible');
    });
  });

  it('Kubeconfig with preselected namespace', () => {
    cy.wrap(generateParamsWithNamespace()).then(params => {
      cy.visit(`${config.clusterAddress}?init=${params}`);

      cy.url().should('match', /namespaces\/default\/details$/);
      cy.getIframeBody()
        .find('thead')
        .should('be.visible');
    });
  });

  it('Only params from enkode without kubeconfig', () => {
    cy.wrap(generateParamsWithNoKubeconfig()).then(params => {
      cy.visit(`${config.clusterAddress}?init=${params}`);

      cy.getIframeBody()
        .contains(
          'Configuration has been included properly. Please fill remaining required data.',
        )
        .should('be.visible');

      cy.getIframeBody()
        .contains('Drag file here')
        .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

      cy.url().should('match', /namespaces$/);

      cy.getLeftNav()
        .contains('Testing Busola')
        .click();

      cy.getLeftNav()
        .contains('Test nav node')
        .should('be.visible');
    });
  });

  it('Login without token in kubeconfig', () => {
    cy.wrap(generateParamsAndToken()).then(({ token, params }) => {
      cy.visit(`${config.clusterAddress}?init=${params}`);

      cy.getIframeBody()
        .find('[role=alert]')
        .contains(
          'It looks like your kubeconfig is incomplete. Please fill the additional fields.',
        )
        .should('be.visible');

      cy.getIframeBody()
        .contains(
          'Configuration has been included properly. Please fill remaining required data.',
        )
        .should('be.visible');

      cy.getIframeBody()
        .find('[placeholder="Token"]')
        .type(token);

      cy.getIframeBody()
        .contains('Apply configuration')
        .click();

      cy.url().should('match', /namespaces$/);
      cy.getIframeBody()
        .find('thead')
        .should('be.visible');
    });
  });
});
