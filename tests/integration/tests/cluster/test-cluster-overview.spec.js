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

  it('Check injections', () => {
    // upload injection
    cy.contains('ui5-button', 'Upload YAML').click();
    cy.loadFiles('examples/injections/countingcard.yaml').then(resources => {
      const input = resources.map(r => jsyaml.dump(r)).join('\n---\n');
      cy.pasteToMonaco(input);
    });
    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();
    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 1);

    cy.reload();

    // test injected RadialGraph exists and works
    cy.get('.radial-chart-card')
      .contains('.ui5-card-header-title', 'MyTitle')
      .get('.radial-chart')
      .contains('text.progress-label', '50%')
      .get('.radial-chart')
      .contains('span.additional-info', 'test1233456');

    // test injected statistical card exists and works
    cy.contains(
      'ui5-card.counting-card.item',
      'HPAs Statistical Injection Example',
    )
      .find('ui5-link.counting-card__link')
      .click();

    cy.get('ui5-title')
      .contains('Hpatest')
      .should('be.visible');

    // remove injection
    cy.getLeftNav()
      .contains('Back To Cluster Details')
      .click();
    cy.navigateTo('Configuration', 'Extensions');
    cy.deleteFromGenericList('Extension', 'hpatest');

    cy.reload();

    // test injected statistical card does not exist
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();

    cy.contains('.ui5-card-header-title', 'MyTitle').should('not.exist');

    cy.contains(
      'ui5-card.counting-card.item',
      'HPAs Statistical Injection Example',
    ).should('not.exist');
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
      cy.get('ui5-table-row')
        .first()
        .find('ui5-table-cell')
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
