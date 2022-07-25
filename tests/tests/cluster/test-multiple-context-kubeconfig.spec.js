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

      cy.getIframeBody()
        .contains('Connect cluster')
        .click();

      cy.getIframeBody()
        .contains('Drag your file here or click to upload')
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
        .find('[role=combobox]')
        .within(() => {
          cy.contains(kubeconfig['current-context']).click();
        });

      cy.getIframeBody()
        .find('[role=option]')
        .within(() => {
          cy.contains(kubeconfig.contexts[1].name);
        });

      cy.getIframeBody()
        .find('[role=option]')
        .within(() => {
          cy.contains('All contexts').click();
        });

      cy.getIframeBody()
        .contains('Next')
        .click();

      cy.getIframeBody()
        .find('[role="dialog"]')
        .contains('button', 'Connect cluster')
        .click();

      cy.getIframeBody()
        .contains('Cluster Details')
        .should('exist');

      cy.get('[data-testid=luigi-topnav-title]')
        .contains(kubeconfig.contexts[0].name)
        .should('exist');

      cy.get('[data-testid="app-switcher"]').click();

      cy.get('#appSwitcherPopover')
        .contains(kubeconfig.contexts[1].name)
        .click();

      cy.url().should(
        'match',
        new RegExp(`${kubeconfig.contexts[1].name}/overview$`),
      );

      cy.get('[data-testid=luigi-topnav-title]')
        .contains(kubeconfig.contexts[1].name)
        .should('exist');

      cy.get('[data-testid="app-switcher"]').click();

      cy.get('#appSwitcherPopover')
        .contains('Clusters Overview')
        .click();

      cy.url().should('match', new RegExp(`/clusters$`));

      cy.getIframeBody()
        .contains(kubeconfig.contexts[0].name)
        .should('exist');

      cy.getIframeBody()
        .contains(kubeconfig.contexts[1].name)
        .should('exist');
    });
  });
});
