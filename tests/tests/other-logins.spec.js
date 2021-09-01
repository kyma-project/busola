/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadKubeconfig } from '../support/loadKubeconfigFile';

context('Other login options', () => {
  it('Kubeconfig and token separately', () => {
    cy.wrap(loadKubeconfig()).then(kubeconfig => {
      const token = kubeconfig.users[0].user.token;
      kubeconfig.users[0].user.token = null;

      cy.visit(`${config.clusterAddress}/clusters`);

      cy.getIframeBody()
        .contains('Add a Cluster')
        .click();

      cy.getIframeBody()
        .find('#textarea-kubeconfig')
        // "paste" command doesn't work here
        .then(subj => subj.val(JSON.stringify(kubeconfig)))
        // trigger onchange
        .type(' ')
        .click();

      cy.getIframeBody()
        .contains('Apply kubeconfig')
        .click();

      cy.getIframeBody()
        .find('[role=alert]')
        .contains(
          'It looks like your kubeconfig is incomplete. Please fill the additional fields.',
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

  it('Reset endpoint', () => {
    cy.loginAndSelectCluster();
    cy.url().should('match', /namespaces$/);

    cy.visit(`${config.clusterAddress}/reset`);
    cy.url().should('match', /clusters$/);
  });
});
