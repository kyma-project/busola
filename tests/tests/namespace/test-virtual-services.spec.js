import jsyaml from 'js-yaml';

const SERVICE_NAME = `test-virtual-service-${Math.floor(Math.random() * 9999) +
  1000}`;

async function loadVirtualService() {
  const content = await new Promise(resolve => {
    cy.fixture('test-virtual-service.yaml').then(content => resolve(content));
  });
  const service = jsyaml.load(content);

  service.metadata.name = SERVICE_NAME;
  service.metadata.namespace = Cypress.env('NAMESPACE_NAME');

  return service;
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

    cy.wrap(loadVirtualService()).then(config => {
      const configString = JSON.stringify(config);
      cy.getIframeBody()
        .find('textarea[aria-roledescription="editor"]')
        .first()
        .type('{selectall}{backspace}{selectall}{backspace}')
        .paste({ pastePayload: configString });
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
