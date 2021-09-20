/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { generateDefaultParams, mockParamsEnabled } from '../support/enkode';

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
      storage: 'sessionStorage',
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

  it('Init params config override target cluster config', () => {
    mockParamsEnabled();

    cy.intercept(requestData, configMock);
    cy.wrap(generateDefaultParams()).then(params => {
      cy.visit(`${config.clusterAddress}/clusters?init=${params}`);
    });
    cy.url().should('match', /namespaces$/);

    cy.contains('Category from target cluster').should('not.exist');
  });
});
