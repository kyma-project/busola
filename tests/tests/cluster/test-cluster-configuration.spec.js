/// <reference types="cypress" />
import 'cypress-file-upload';

const configMock = {
  data: {
    config: JSON.stringify({
      config: {
        features: {
          DISABLED_NODES: {
            nodes: [],
            isEnabled: false,
          },
          EXTERNAL_NODES: {
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

  // Luigi throws error of the "replace" function when entering the Preferences dialog. Remove the code below after Luigi's removal
  Cypress.on('uncaught:exception', () => {
    return false;
  });

  it('Applies config from target cluster', () => {
    cy.intercept(requestData, configMock);
    cy.loginAndSelectCluster();
    cy.url().should('match', /overview$/);

    // cluster storage message should be visible
    cy.contains(/The chosen storage type has been overwritten/).should(
      'be.visible',
    );

    // custom category should be added
    cy.contains('Category from target cluster').should('be.visible');

    // custom storage type should be set
    cy.getLeftNav()
      .contains('Cluster Details')
      .click();
    cy.contains('SESSION STORAGE').should('be.visible');
  });

  it('Test pagination', () => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Cluster Roles');

    cy.get('[role=row]').should('have.length', 20);

    cy.get('i.sap-icon--customer').click();

    cy.contains('Preferences').click();

    cy.contains('Other').click();

    cy.get('[role=dialog]')
      .contains('20')
      .click();

    cy.get('[role=list]:visible')
      .contains('10')
      .click();

    cy.contains('Close').click();

    cy.get('[role=row]').should('have.length', 10);
  });
});
