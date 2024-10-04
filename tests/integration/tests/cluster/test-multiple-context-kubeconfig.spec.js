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

  before(() => {
    cy.handleExceptions();
  });

  it('User can choose different context with the multiple context kubeconfig', () => {
    cy.handleExceptions();

    cy.wrap(loadMultipleContextKubeconfig()).then(kubeconfig => {
      cy.visit(`${config.clusterAddress}/clusters`)
        .get('ui5-button:visible')
        .contains('Connect')
        .click();

      cy.contains('Drop a .kubeconfig file or click to upload').attachFile(
        {
          fileContent: jsyaml.dump(kubeconfig),
          filePath: 'kubeconfig.yaml',
        },
        {
          subjectType: 'drag-n-drop',
        },
      );

      cy.contains('Next').click();

      cy.get('[role=combobox]')
        .contains(kubeconfig['current-context'])
        .click();

      cy.get('ui5-li:visible').contains(kubeconfig.contexts[1].name);

      cy.get('ui5-li:visible')
        .contains('All contexts')
        .click();

      cy.contains('Next').click({ force: true });

      cy.get('ui5-button:visible')
        .contains('Next step')
        .click();

      cy.get(`[accessible-name="last-step"]:visible`)
        .contains('Connect cluster')
        .click({ force: true });

      cy.contains('Cluster Details').should('exist');

      cy.changeCluster(kubeconfig.contexts[1].name);

      cy.url().should(
        'match',
        new RegExp(`${kubeconfig.contexts[1].name}/overview$`),
      );

      cy.changeCluster('all-clusters');

      cy.url().should('match', new RegExp(`/clusters$`));

      cy.contains(kubeconfig.contexts[0].name).should('exist');

      cy.contains(kubeconfig.contexts[1].name).should('exist');
    });
  });
});
