/// <reference types="cypress" />

function mockPermissionsCall(permissions) {
  cy.intercept(
    {
      method: 'POST',
      url: '/backend/apis/authorization.k8s.io/v1/selfsubjectrulesreviews',
    },
    {
      kind: 'SelfSubjectRulesReview',
      apiVersion: 'authorization.k8s.io/v1',
      status: {
        resourceRules: permissions,
      },
    },
  );
}

context('Test reduced permissions 2', () => {
  Cypress.skipAfterFail();

  it('Test displaying navigation nodes', () => {
    const mockClusterPermissions = () =>
      mockPermissionsCall([
        {
          verbs: ['*'],
          apiGroups: [''],
          resources: ['namespaces', 'pods'],
        },
      ]);

    const mockNamespacePermissions = () =>
      mockPermissionsCall([
        {
          verbs: ['*'],
          apiGroups: [''],
          resources: ['namespaces', 'pods', 'services'],
        },
      ]);

    // check out cluster view - expect only Namespaces here
    mockClusterPermissions();
    cy.loginAndSelectCluster();

    cy.getLeftNav()
      .contains('Namespaces')
      .should('exist');

    cy.getLeftNav()
      .contains('Events')
      .should('not.exist');

    // check out "normal" namespace view - expect only Pods here
    cy.goToNamespaceDetails();

    cy.getLeftNav()
      .contains('Discovery and Network')
      .should('not.exist');

    cy.getLeftNav()
      .contains('Workloads')
      .should('exist')
      .click();

    cy.getLeftNav()
      .contains('Pods')
      .should('exist');

    cy.getLeftNav()
      .contains('Deployments')
      .should('not.exist');

    // check out "special" namespace view - expect Pods and Services here
    mockNamespacePermissions();
    cy.getTopNav()
      .contains(Cypress.env('NAMESPACE_NAME'))
      .click();
    cy.get('[role="menu"]')
      .contains('kube-public')
      .click();

    cy.getLeftNav()
      .contains('Pods')
      .should('exist');

    cy.getLeftNav()
      .contains('Discovery and Network')
      .should('exist')
      .click();

    cy.getLeftNav()
      .contains('Services')
      .should('exist');

    cy.getLeftNav()
      .contains('API Rules')
      .should('not.exist');
  });

  it('Test extension CMs call - user has access to clusterwide CMs', () => {
    cy.intercept({
      method: 'GET',
      url:
        '/backend/api/v1/configmaps?labelSelector=busola.io/extension=resource',
    }).as('clusterwide CM call');

    cy.loginAndSelectCluster();

    cy.wait('@clusterwide CM call');

    mockPermissionsCall([
      {
        verbs: ['*'],
        apiGroups: [''],
        resources: ['namespaces', 'pods'],
      },
    ]);

    cy.intercept({
      method: 'GET',
      url:
        '/backend/api/v1/namespaces/kube-public/configmaps?labelSelector=busola.io/extension=resource',
    }).as('kube-public CM call');

    cy.reload();

    cy.wait('@kube-public CM call');
  });
});
