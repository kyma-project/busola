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
          resources: ['namespaces', 'pods', 'persistentvolumeclaims'],
        },
      ]);

    // check out cluster view - expect only Namespaces here
    mockClusterPermissions();
    cy.loginAndSelectCluster();

    cy.getLeftNav()
      .contains('Namespaces', { includeShadowDom: true })
      .should('exist');

    cy.getLeftNav()
      .contains('Events', { includeShadowDom: true })
      .should('not.exist');

    // check out "normal" namespace view - expect only Pods here
    cy.goToNamespaceDetails();

    cy.getLeftNav()
      .contains('Discovery and Network', { includeShadowDom: true })
      .should('not.exist');

    cy.getLeftNav()
      .contains('Workloads', { includeShadowDom: true })
      .should('exist')
      .click();

    cy.getLeftNav()
      .contains('Pods', { includeShadowDom: true })
      .should('exist');

    cy.getLeftNav()
      .contains('Deployments', { includeShadowDom: true })
      .should('not.exist');

    // check out "special" namespace view - expect Pods and Services here
    mockNamespacePermissions();

    cy.getLeftNav()
      .contains('Back To Cluster Details', { includeShadowDom: true })
      .click();

    cy.getLeftNav()
      .contains('Namespaces', { includeShadowDom: true })
      .click();

    cy.get('[aria-label="open-search"]').click();

    cy.get('[aria-label="search-input"]').type('kube-public');

    cy.get('[role="row"]')
      .contains('kube-public')
      .click();

    cy.getLeftNav()
      .contains('Pods', { includeShadowDom: true })
      .should('exist');

    cy.getLeftNav()
      .contains('Storage', { includeShadowDom: true })
      .should('exist')
      .click();

    cy.getLeftNav()
      .contains('Persistent Volume Claims', { includeShadowDom: true })
      .should('exist');

    cy.getLeftNav()
      .contains('Secrets', { includeShadowDom: true })
      .should('not.exist');
  });

  it('Test extension CMs call - user has access to clusterwide CMs', () => {
    //spy na fetching CMs in the cluster-context, you have access
    cy.intercept({
      method: 'GET',
      url:
        '/backend/api/v1/configmaps?labelSelector=busola.io/extension=resource',
    }).as('clusterwide CM call');

    cy.loginAndSelectCluster();

    cy.wait('@clusterwide CM call');
  });

  it('Test extension CMs call - user has no access to clusterwide CMs, fallback to namespace wide CMs', () => {
    const namespaceName = Cypress.env('NAMESPACE_NAME');

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();

    mockPermissionsCall([
      {
        verbs: ['*'],
        apiGroups: [''],
        resources: ['pods', 'configmaps'],
        namespace: namespaceName,
      },
    ]);

    cy.intercept({
      method: 'GET',
      url: `/backend/api/v1/namespaces/${namespaceName}/configmaps?labelSelector=busola.io/extension=resource`,
    }).as('logged namespace CM call');

    cy.reload();
    cy.wait('@logged namespace CM call');
  });
});
