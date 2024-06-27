/// <reference types="cypress" />
import 'cypress-file-upload';
import jsyaml from 'js-yaml';

context('Test Cluster Overview', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Cluster Overview details', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('ui5-title', 'Cluster Details').should('be.visible');

    cy.contains('Version')
      .next('.content')
      .should('not.be.empty');

    cy.contains('API Server Address')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Nodes').should('be.visible');

    cy.contains('Events').should('be.visible');
  });

  it('Check statistical card injection', () => {
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('ui5-button', 'Upload YAML').click();

    cy.loadFiles('examples/injections/countingcard-injection.yaml').then(
      resources => {
        const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
        cy.pasteToMonaco(input);
      },
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 1);

    cy.reload();

    cy.contains('ui5-card.counting-card.item', 'HPA examples')
      .find('ui5-link.counting-card__link')
      .click();

    cy.get('ui5-title')
      .contains('Horizontal Pod Autoscalers')
      .should('be.visible');
  });

  it('Check feedback feature via feature flag', () => {
    cy.setBusolaFeature('FEEDBACK', true);

    cy.loginAndSelectCluster();

    cy.get('[name="feedback"]').should('exist');

    cy.setBusolaFeature('FEEDBACK', false);

    cy.loginAndSelectCluster();

    cy.get('[name="feedback"]').should('not.exist');
  });

  it('Go to Node details', () => {
    cy.wait(500);

    cy.contains('ui5-panel', 'Nodes').within(_ => {
      cy.get('a')
        .first()
        .click();
    });
  });

  it('Test Node details', () => {
    cy.contains('Pod CIDR')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Internal IP')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Hostname')
      .next('.content')
      .should('not.be.empty');

    cy.contains('CPU').should('be.visible');

    cy.contains('Machine info').should('be.visible');

    cy.contains('Events').should('be.visible');
  });
});
