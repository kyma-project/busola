/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';

context('Test Services', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
    });
    cy.createNamespace('services');
  });

  beforeEach(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
  });

  it('Creates the EXT Services config', () => {
    cy.getIframeBody().as('iframe');

    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.get('@iframe')
      .contains('Upload YAML')
      .click();

    cy.loadFiles('examples/services/configuration/services.yaml').then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.get('@iframe')
      .contains('Submit')
      .click();

    cy.get('@iframe')
      .find('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 1);

    cy.loadFiles('examples/services/samples.yaml').then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.get('@iframe')
      .contains('Submit')
      .click();

    cy.get('@iframe')
      .find('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 1);
  });

  it('Displays the EXT Services list view', () => {
    cy.loginAndSelectCluster({
      fileName: 'kubeconfig-k3s.yaml',
      storage: 'Session storage',
    });

    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .as('iframe')
      .contains('a', 'services')
      .click();

    cy.getLeftNav()
      .contains('Examples')
      .click();

    cy.getLeftNav()
      .contains('Custom Services')
      .click();

    cy.get('@iframe').contains('Type');
    cy.get('@iframe').contains('LoadBalancer');
    cy.get('@iframe').contains('Create Custom Service');
    cy.get('@iframe')
      .contains('a', 'test-service')
      .click({ force: true });
  });

  it('Displays the EXT Services detail view', () => {
    cy.getIframeBody()
      .as('iframe')
      .contains('Type');
    cy.get('@iframe').contains('LoadBalancer');
    cy.get('@iframe').contains('a', 'Custom Services');
  });

  it('Displays the header overridden by translations', () => {
    cy.getIframeBody().contains('Cluster IP override');
  });
});
