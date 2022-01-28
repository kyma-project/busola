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
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Config Map Name"]:visible')
      .type(NAME);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]:visible')
      .eq(1)
      .type('protected');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]:visible')
      .eq(1)
      .type('true');

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Protect a resource', () => {
    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.getIframeBody()
      .contains('tr', NAME)
      .find('[aria-label="Delete"]')
      .should('be.disabled')
      .click({ force: true });

    cy.getIframeBody()
      .contains(`Delete ${NAME}`)
      .should('not.exist');
  });

  it('Create a protected Pod controlled by Deployment', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Deployments')
      .click();

    cy.getIframeBody()
      .contains('Create Deployment')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Deployment Name"]:visible')
      .clear()
      .type(NAME);

    cy.getIframeBody()
      .find('[placeholder^="Enter the Docker image"]:visible')
      .type(IMAGE);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Check if Pod is protected', () => {
    cy.url().should('match', new RegExp(`\/deployments\/details\/${NAME}$`));

    cy.getIframeBody()
      .contains('tr', NAME, { timeout: 5000 })
      .find('[aria-label="Delete"]')
      .should('be.disabled');
  });

  it('Change protection setting', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getModalIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getModalIframeBody()
      .contains(
        '.preferences-row',
        'Allow for modification of protected resources',
      )
      .find('.fd-switch')
      .click();

    cy.get('[aria-label="close"]').click();
  });

  it("Don't protect a resource", () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Config Maps')
      .click();

    cy.getIframeBody()
      .contains('tr', NAME)
      .find('[aria-label="Delete"]')
      .click();

    cy.getIframeBody()
      .contains(`Delete ${NAME}`)
      .should('exist');

    cy.getIframeBody()
      .contains('button', 'Cancel')
      .click();
  });
});
