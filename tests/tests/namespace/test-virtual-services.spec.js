import { loadFile } from '../../support/loadFile';

const SERVICE_NAME = `test-virtual-service-${Math.floor(Math.random() * 9999) +
  1000}`;

async function loadVirtualService() {
  const service = await loadFile('test-virtual-service.yaml');
  const newService = { ...service };
  service.metadata.name = SERVICE_NAME;
  service.metadata.namespace = Cypress.env('NAMESPACE_NAME');

  return newService;
}

context('Test Virtual Services', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Virtual Service', () => {
    cy.navigateTo('Istio', 'Virtual Services');

    cy.getIframeBody()
      .contains('Create Virtual Service')
      .click();

    cy.wrap(loadVirtualService()).then(VS_CONFIG => {
      const VS = JSON.stringify(VS_CONFIG);
      cy.pasteToMonaco(VS);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.url().should(
      'match',
      new RegExp(`/virtualservices/details/${SERVICE_NAME}$`),
    );
  });

  it('Inspect Virtual Service', () => {
    cy.getIframeBody().contains('h3', SERVICE_NAME);
    cy.getIframeBody().contains(
      'kyma-gateway-application-connector.kyma-system.svc.cluster.local',
    );
    cy.getIframeBody().contains('host1.example.com');
    cy.getIframeBody().contains('matches ^/uri-*regex?');
    cy.getIframeBody().contains('is exactly exact-uri');
    cy.getIframeBody().contains('starts with prefixed-uri (ignore case)');
    cy.getIframeBody().contains('TLS Route');
    cy.getIframeBody().contains('SNI Hosts');
    cy.getIframeBody().contains('TCP Route');
    cy.getIframeBody().contains('Destinations');
    cy.getIframeBody().contains('CORS Policy');
    cy.getIframeBody().contains('Redirect');
    cy.getIframeBody().contains('Delegate');
  });

  it('Inspect service list', () => {
    cy.inspectList('Virtual Services', SERVICE_NAME);
  });
});
