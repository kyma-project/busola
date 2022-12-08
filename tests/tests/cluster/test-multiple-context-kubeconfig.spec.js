/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../../config';
import { loadFile } from '../../support/loadFile';
import jsyaml from 'js-yaml';

async function loadMultipleContextKubeconfig() {
  const kubeconfig = await loadFile('kubeconfig.yaml');

  const newCluster = { ...kubeconfig?.clusters[0] };
  newCluster.name += '-new';

  const newUser = { ...kubeconfig?.users[0] };
  newUser.name += '-new';
  newUser.user.cluster = newUser.name;

  const oldContext = { ...kubeconfig?.contexts[0] };
  oldContext.name += '-old';

  const newContext = { ...kubeconfig?.contexts[0] };
  newContext.name += '-new';
  newContext.context.cluster = newCluster.name;
  newContext.context.user = newUser.name;

  const newKubeconfig = {
    ...kubeconfig,
    'current-context': oldContext.name,
    contexts: [oldContext, newContext],
    clusters: [...kubeconfig.clusters, newCluster],
    users: [...kubeconfig.users, newUser],
  };
  return newKubeconfig;
}

context('Test multiple context kubeconfig', () => {
  Cypress.skipAfterFail();

  it('User can choose different context with the multiple context kubeconfig', () => {
    cy.wrap(loadMultipleContextKubeconfig()).then(kubeconfig => {
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

      cy.get('[role=combobox]').within(() => {
        cy.contains(kubeconfig['current-context']).click();
      });

      cy.get('[role=option]').within(() => {
        cy.contains(kubeconfig.contexts[1].name);
      });

      cy.get('[role=option]').within(() => {
        cy.contains('All contexts').click();
      });

      cy.contains('Next').click();

      cy.get('[role="dialog"]')
        .contains('button', 'Connect cluster')
        .click();

      cy.contains('Cluster Details').should('exist');

      cy.get('[aria-controls="fd-shellbar-product-popover"]')
        .contains(kubeconfig.contexts[0].name)
        .should('exist');

      cy.get('[aria-controls="fd-shellbar-product-popover"]').click();

      cy.get('[role=menuitem]:visible')
        .contains(kubeconfig.contexts[1].name)
        .click();

      cy.url().should(
        'match',
        new RegExp(`${kubeconfig.contexts[1].name}/overview$`),
      );

      cy.get('[aria-controls="fd-shellbar-product-popover"]')
        .contains(kubeconfig.contexts[1].name)
        .should('exist');

      cy.get('[aria-controls="fd-shellbar-product-popover"]').click();

      cy.get('[role=menuitem]:visible')
        .contains('Clusters Overview')
        .click();

      cy.url().should('match', new RegExp(`/clusters$`));

      cy.contains(kubeconfig.contexts[0].name).should('exist');

      cy.contains(kubeconfig.contexts[1].name).should('exist');
    });
  });
});
