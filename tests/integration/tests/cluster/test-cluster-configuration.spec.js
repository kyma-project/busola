/// <reference types="cypress" />
import 'cypress-file-upload';

const configMock = {
  data: {
    config: JSON.stringify({
      config: {
        features: {
          EXTERNAL_NODES: {
            isEnabled: true,
            nodes: [
              {
                category: 'Category from target cluster',
                icon: 'course-book',
                children: [
                  {
                    label: 'Example label',
                    link: 'http://test',
                  },
                ],
              },
            ],
          },
        },
        storage: 'inMemory',
      },
    }),
  },
};

const requestData = {
  method: 'GET',
  url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
};

context('Test Cluster configuration', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.handleExceptions();
  });

  it('Applies config from target cluster', () => {
    cy.intercept(requestData, configMock);
    cy.loginAndSelectCluster();
    cy.url().should('match', /overview$/);

    // custom category should be added
    cy.contains('Category from target cluster').should('be.visible');

    // custom storage type should be set
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();
  });

  it('Test pagination', () => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Cluster Roles');

    cy.get('ui5-table')
      .find('ui5-table-row')
      .should('have.length', 20);

    cy.get('[title="Profile"]').click();

    cy.get('ui5-menu-item:visible')
      .contains('Preferences')
      .click({ force: true });

    cy.contains('Other')
      .parentsUntil('[role=tab]')
      .click({ force: true });

    cy.get('ui5-dialog')
      .contains('20')
      .click();

    cy.get('ui5-option:visible')
      .contains('10')
      .click();

    cy.contains('Close').click();

    cy.get('ui5-table-row').should('have.length', 10);
  });
});
