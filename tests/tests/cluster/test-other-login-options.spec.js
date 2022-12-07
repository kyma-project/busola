/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../../config';
import { loadFile } from '../../support/loadFile';
import jsyaml from 'js-yaml';

context('Test other login options', () => {
  Cypress.skipAfterFail();

  Cypress.on('uncaught:exception', err => {
    // Ignor error from Monaco loading (Cypress issues)
    if (
      err.message.includes(
        "TypeError: Cannot read properties of null (reading 'sendError')",
      ) ||
      err.message.includes(
        "Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'http://localhost:8080/static/js/vendors-node_modules_monaco-editor_esm_vs_editor_editor_worker_js.chunk.js' failed to load.",
      )
    ) {
      return false;
    }
  });

  it('Kubeconfig and token separately', () => {
    cy.wrap(loadFile('kubeconfig.yaml')).then(kubeconfig => {
      const token = kubeconfig.users[0].user.token;
      kubeconfig.users[0].user.token = null;

      cy.visit(`${config.clusterAddress}/clusters`);

      cy.contains('Connect cluster').click();

      cy.contains('Drag your file here or click to upload').attachFile(
        {
          fileContent: jsyaml.dump(kubeconfig),
          filePath: 'kubeconfig.yaml',
        },
        {
          subjectType: 'drag-n-drop',
        },
      );

      cy.contains('Next').click();

      cy.contains(
        '[role=alert]',
        "We couldn't find enough authentication information",
      ).should('be.visible');

      cy.contains('Token')
        .parent()
        .next()
        .type(token);

      cy.contains('Next').click();

      cy.contains('[role="dialog"] button', 'Connect cluster').click();

      cy.url().should('match', /overview$/);
      cy.contains('Cluster Details').should('be.visible');
    });
  });

  it('Reset endpoint', () => {
    cy.loginAndSelectCluster();
    cy.url().should('match', /overview$/);

    cy.visit(`${config.clusterAddress}/reset`);
    cy.url().should('match', /clusters$/);
  });
});
