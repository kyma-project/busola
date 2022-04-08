/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../../config';
import { loadFile } from '../../support/loadFile';
import jsyaml from 'js-yaml';

context('Test other login options', () => {
  Cypress.skipAfterFail();

  it('Kubeconfig and token separately', () => {
    cy.wrap(loadFile('kubeconfig.yaml')).then(kubeconfig => {
      const token = kubeconfig.users[0].user.token;
      kubeconfig.users[0].user.token = null;

      cy.visit(`${config.clusterAddress}/clusters`);

      cy.getIframeBody()
        .contains('Connect cluster')
        .click();

      cy.getIframeBody()
        .contains('Drag your file here or click to browse your computer')
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
        .contains("We couldn't find enough authentication information")
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
        .find('[role="dialog"]')
        .contains('button', 'Connect cluster')
        .click();

      cy.url().should('match', /overview$/);
      cy.getIframeBody()
        .find('thead')
        .should('be.visible');
    });
  });

  it('Reset endpoint', () => {
    cy.loginAndSelectCluster();
    cy.url().should('match', /overview$/);

    cy.visit(`${config.clusterAddress}/reset`);
    cy.url().should('match', /clusters$/);
  });
});
