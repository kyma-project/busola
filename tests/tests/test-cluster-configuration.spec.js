/// <reference types="cypress" />
import 'cypress-file-upload';

const configMock = {
  data: {
    config: JSON.stringify({
      config: {
        navigation: {
          disabledNodes: [],
          externalNodes: [
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
      .contains('Cluster Overview')
      .click();
    cy.contains('sessionStorage').should('be.visible');
  });

  it('Test pagination', () => {
    cy.loginAndSelectCluster();

    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Cluster Roles')
      .click();

    cy.getIframeBody()
      .find('[role=datarow]')
      .should('have.length', 20);

    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('Other')
      .click();

    cy.getModalIframeBody()
      .contains('20')
      .click();

    cy.getModalIframeBody()
      .contains('10')
      .click();

    cy.get('[aria-label="close"]').click();

    cy.getIframeBody()
      .find('[role=datarow]')
      .should('have.length', 10);
  });
});
