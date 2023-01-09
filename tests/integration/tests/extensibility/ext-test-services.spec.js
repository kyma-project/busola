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
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('Upload YAML').click();

    cy.loadFiles('examples/services/configuration.yaml').then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.contains('Submit').click();

    cy.get('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 1);

    cy.loadFiles('examples/services/samples.yaml').then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });

    cy.contains('Submit').click();

    cy.get('.fd-dialog__body')
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

    cy.contains('a', 'services').click();

    cy.getLeftNav()
      .contains('Examples')
      .click();

    cy.getLeftNav()
      .contains('Custom Services')
      .click();

    cy.contains('Type');
    cy.contains('LoadBalancer');
    cy.contains('Create Custom Service');
  });

  it('Displays the header overridden by translations (on List)', () => {
    cy.contains('Cluster IP override');
  });

  it('Displays the EXT Services detail view', () => {
    cy.contains('a', 'test-service').click({ force: true });

    cy.contains('Type');
    cy.contains('LoadBalancer');
    cy.contains('a', 'Custom Services');
  });

  it('Displays the header overridden by translations (on Details)', () => {
    cy.contains('Cluster IP override');
  });
});
