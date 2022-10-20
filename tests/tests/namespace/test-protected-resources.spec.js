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

  // Luigi throws error of the "replace" function when entering the Preferences dialog. Remove the code below after Luigi's removal
  Cypress.on('uncaught:exception', () => {
    return false;
  });

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
    cy.navigateTo('Configuration', 'Config Maps');

    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="ConfigMap name"]:visible')
      .type(NAME);

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .eq(1)
      .type('protected');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible')
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
    cy.navigateTo('Workloads', 'Deployments');

    cy.getIframeBody()
      .contains('Create Deployment')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Deployment name"]:visible')
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
      .contains('tr', NAME)
      .find('[aria-label="Delete"]')
      .should('be.disabled');
  });

  it('Change protection setting', () => {
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    cy.contains('Preferences').click();

    cy.getIframeBody()
      .contains('Cluster interaction')
      .click();

    cy.getIframeBody()
      .contains(
        '.preferences-row',
        'Allow for modification of protected resources',
      )
      .find('.fd-switch')
      .click();

    cy.getIframeBody()
      .contains('Close')
      .click();
  });

  it("Don't protect a resource", () => {
    cy.navigateTo('Configuration', 'Config Maps');

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
