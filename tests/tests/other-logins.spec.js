/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadKubeconfig } from '../support/loadKubeconfigFile';
import jsyaml from 'js-yaml';

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
        .contains('Drag file here')
        .attachFile(
          {
            fileContent: jsyaml.dump(kubeconfig),
            filePath: 'kubeconfig.yaml',
          },
          {
            subjectType: 'drag-n-drop',
          },
        );

      cy.getIframeBody()
        .contains('Next')
        .click();

      cy.getIframeBody()
        .find('[role=alert]')
        .contains(
          "We couldn't find enough authentication information in your kubeconfig.",
        )
        .should('be.visible');

      cy.getIframeBody()
        .contains('Token')
        .parent()
        .next()
        .type(token);

      cy.getIframeBody()
        .contains('Next')
        .click();

      cy.getIframeBody()
        .contains('Add Cluster')
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
