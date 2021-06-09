/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import {
  generateDefaultParams,
  generateParamsWithNoKubeconfig,
  generateParamsAndToken,
  generateParamsWithHiddenNamespacesList,
} from '../support/enkode';

const SYSTEM_NAMESPACE = 'kyma-system';

context('Login - enkode link', () => {
  it('Unmodified kubeconfig with default hidden namespaces', () => {
    cy.wrap(generateDefaultParams()).then(params => {
      cy.visit(`${config.clusterAddress}?init=${params}`);

      cy.url().should('match', /namespaces$/);
      cy.getIframeBody()
        .find('thead')
        .should('be.visible');

      cy.getIframeBody()
        .find('[role="search"] [aria-label="search-input"]')
        .type(config.namespaceName, { force: true });

      cy.getIframeBody()
        .contains('a', config.namespaceName, { timeout: 7000 })
        .should('be.visible');

      cy.getIframeBody()
        .find('[role="search"] [aria-label="search-input"]')
        .clear({ force: true })
        .type(SYSTEM_NAMESPACE, { force: true });

      cy.getIframeBody()
        .contains('a', SYSTEM_NAMESPACE, { timeout: 7000 })
        .should('not.exist');
    });
  });

  it('Kubeconfig with a hidden namespace', () => {
    cy.wrap(generateParamsWithHiddenNamespacesList(config.namespaceName)).then(
      params => {
        cy.visit(`${config.clusterAddress}?init=${params}`);

        cy.url().should('match', /namespaces$/);
        cy.getIframeBody()
          .find('thead')
          .should('be.visible');

        cy.getIframeBody()
          .find('[role="search"] [aria-label="search-input"]')
          .type(config.namespaceName, { force: true });

        cy.getIframeBody()
          .contains('a', config.namespaceName, { timeout: 7000 })
          .should('not.exist');

        cy.getIframeBody()
          .find('[role="search"] [aria-label="search-input"]')
          .clear({ force: true })
          .type(SYSTEM_NAMESPACE, { force: true });

        cy.getIframeBody()
          .contains('a', SYSTEM_NAMESPACE, { timeout: 7000 })
          .should('be.visible');
      },
    );
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
