/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { loadMultipleContextKubeconfig } from '../support/loadKubeconfigFile';
import jsyaml from 'js-yaml';

context('Multiple context kubeconfig', () => {
  it('User can choose different context with the multiple context kubeconfig', () => {
    cy.wrap(loadMultipleContextKubeconfig()).then(kubeconfig => {
      cy.visit(`${config.clusterAddress}/clusters`);

      cy.getIframeBody()
        .contains('Connect a cluster')
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
        .contains('button', 'Connect a cluster')
        .click();

      cy.getIframeBody()
        .contains('Cluster Overview')
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
