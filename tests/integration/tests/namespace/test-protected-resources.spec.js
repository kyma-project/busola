const NAME = `test-resource-${Math.floor(Math.random() * 9999) + 1000}`;
const IMAGE = 'nginx:latest';

const busolaConfig = JSON.stringify({
  config: {
    features: {
      PROTECTED_RESOURCES: {
        isEnabled: true,
        config: {
          resources: [
            {
              match: { '$.metadata.labels.protected': 'true' },
            },
            {
              match: {
                '$.metadata.ownerReferences[0].kind':
                  '^[a-zA-Z]([a-zA-Z0-9_-]*)$',
              },
              regex: true,
            },
          ],
        },
      },
    },
  },
});

const configMap = JSON.stringify({
  kind: 'ConfigMap',
  apiVersion: 'v1',
  data: { config: busolaConfig },
});

context('Test Protected Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.intercept(
      {
        method: 'GET',
        url: /kube-public\/configmaps\/busola-config$/,
      },
      configMap,
    );
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a protected resource', () => {
    cy.wait(500); // TODO
    cy.navigateTo('Configuration', 'Config Maps');

    cy.contains('Create Config Map').click();

    cy.get('[ariaLabel="ConfigMap name"]:visible').type(NAME);

    cy.contains('Advanced').click();

    cy.get('[role=dialog]')
      .contains('Labels')
      .click();

    cy.get('[placeholder="Enter key"]:visible')
      .eq(1)
      .type('protected');

    cy.get('[placeholder="Enter value"]:visible')
      .eq(1)
      .type('true');

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Protect a resource', () => {
    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.contains('tr', NAME)
      .find('[aria-label="Delete"]')
      .should('be.disabled')
      .click({ force: true });

    cy.contains(`Delete ${NAME}`).should('not.exist');
  });

  it('Create a protected Pod controlled by Deployment', () => {
    cy.navigateTo('Workloads', 'Deployments');

    cy.contains('Create Deployment').click();

    cy.get('[ariaLabel="Deployment name"]:visible')
      .clear()
      .type(NAME);

    cy.get('[placeholder^="Enter the Docker image"]:visible').type(IMAGE);

    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Check if Pod is protected', () => {
    cy.url().should('match', new RegExp(`\/deployments\/${NAME}$`));

    cy.contains('tr', NAME)
      .find('[aria-label="Delete"]')
      .should('be.disabled');
  });

  it('Change protection setting', () => {
    cy.get('[aria-label="topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.contains('Cluster interaction').click();

    cy.contains(
      '.preferences-row',
      'Allow for modification of protected resources',
    )
      .find('.fd-switch')
      .click();

    cy.contains('Close').click();
  });

  it("Don't protect a resource", () => {
    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.contains('tr', NAME)
      .find('[aria-label="Delete"]')
      .click();

    cy.contains(`Delete ${NAME}`).should('exist');

    cy.contains('button', 'Cancel').click();
  });
});
