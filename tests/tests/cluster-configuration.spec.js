/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import { generateDefaultParams } from '../support/enkode';

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

    cy.contains('Category from target cluster').should('be.visible');
  });

  it('Init params config override target cluster config', () => {
    cy.intercept(requestData, configMock);
    cy.wrap(generateDefaultParams()).then(params => {
      cy.visit(`${config.clusterAddress}/clusters?init=${params}`);
    });
    cy.url().should('match', /namespaces$/);

    cy.contains('Category from target cluster').should('not.exist');
  });
});
