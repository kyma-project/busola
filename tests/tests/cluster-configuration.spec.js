/// <reference types="cypress" />
import 'cypress-file-upload';
import config from '../config';
import {
  generateDefaultParams,
  generateParamsWithPreselectedNamespace,
  generateParamsWithNoKubeconfig,
  generateParamsAndToken,
  generateParamsWithHiddenNamespacesList,
  generateParamsWithDisabledFeatures,
  generateUnsupportedVersionParams,
  generateWithKubeconfigId,
} from '../support/enkode';

context('Cluster configuration', () => {
  it('Applies config from target cluster', () => {
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
    cy.intercept(
      {
        method: 'GET',
        url: '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
      },
      configMock,
    );
    cy.loginAndSelectCluster();
    cy.url().should('match', /namespaces$/);

    cy.contains('Category from target cluster').should('be.visible');
  });
});
