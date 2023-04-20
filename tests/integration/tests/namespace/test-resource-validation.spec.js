const podConfig = `
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.14.2
    securityContext:
      capabilities:
        add:
        - NET_ADMIN
    ports:
    - containerPort: 80
`;

const ruleSet = `
apiVersion: v1
rules:
  - name: This is a test rule
    uniqueName: TEST
    documentationUrl: >-
      https://kyma-project.io/
    messageOnFailure: >-
      This is a test rule
    category: Test rule
    schema:
      required: [test]
      properties:
        test:
          type: object
          required: [hello]
          properties:
            hello:
              type: string
              enum:
                - kyma
policies:
  - name: TestPolicy
    rules:
      - TEST
`;

context('Test app settings and preferences', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Disables resource validation', () => {
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Clusters').click();

    cy.contains('Resource Validation').click();

    cy.contains('.preferences-row', 'Validate Resources')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();

    cy.contains('Upload YAML').click();

    cy.pasteToMonaco(podConfig);
    cy.contains('nginx:1.14.2').should('be.visible');
    cy.contains('warnings').should('not.exist');

    cy.contains('.validate-resources', 'Validate resources')
      .find('.fd-switch')
      .click();

    cy.contains('Cancel').click();
  });

  it.only('Enables choosing resource validation policies', () => {
    cy.mockConfigMap({
      label: 'busola.io/resource-validation=rule-set',
      data: ruleSet,
    });
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Clusters').click();

    cy.contains('Resource Validation').click();

    cy.contains('.preferences-row', 'Choose Policies')
      .find('.fd-switch')
      .click();

    cy.contains('.policy-row', 'Default')
      .find('.fd-switch')
      .click();
    cy.contains('.policy-row', 'PodSecurityStandardsBaseline')
      .find('.fd-switch')
      .click();
    cy.contains('.policy-row', 'TestPolicy')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();

    cy.contains('Upload YAML').click();

    cy.pasteToMonaco(podConfig);
    cy.contains('nginx:1.14.2').should('be.visible');
    cy.contains('Show warnings')
      .should('be.visible')
      .click();

    cy.contains(
      'refrain from using insecure capabilities to prevent access to sensitive components',
    ).should('be.visible');
    cy.contains('This is a test rule').should('be.visible');

    cy.contains('Cancel').click();

    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Clusters').click();

    cy.contains('Resource Validation').click();

    cy.contains('.preferences-row', 'Choose Policies')
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();
  });
});
