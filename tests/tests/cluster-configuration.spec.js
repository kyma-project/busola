/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';

const configMock = {
  data: {
    config: JSON.stringify({
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
    }),
  },
};

const requestData = {
  method: 'GET',
  url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
};

context('Cluster configuration', () => {
  it('Applies config from target cluster', () => {
    cy.intercept(requestData, configMock);
    cy.loginAndSelectCluster();
    cy.url().should('match', /namespaces$/);

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
});
