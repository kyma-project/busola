/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadMultipleContextKubeconfig } from '../support/loadKubeconfigFile';
import jsyaml from 'js-yaml';

it('User can add cluster via kubeconfig ID + does not display "Add cluster on overview', () => {
  cy.wrap(loadMultipleContextKubeconfig()).then(kubeconfig => {
    console.log(kubeconfig);

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
      .contains('Next')
      .click();

    cy.getIframeBody()
      .contains('Add Cluster')
      .click();
  });
});
