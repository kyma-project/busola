import jsyaml from 'js-yaml';
import { loadRandomDR } from '../support/loadDR';

const SERVICE_NAME = `test-virtual-service-${Math.floor(Math.random() * 9999) +
  1000}`;

async function loadVirtualService() {
  // const content = await cy.fixture('test-custom-destination-rule.yaml');
  const content = await new Promise(resolve => {
    cy.fixture('test-virtual-service.yaml').then(content => resolve(content));
  });
  const service = jsyaml.load(content);

  service.metadata.name = SERVICE_NAME;
  service.metadata.namespace = Cypress.env('NAMESPACE_NAME');

  return service;
}

context('Test Virtual Services', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Virtual Services', () => {
    cy.getLeftNav()
      .contains('Istio')
      .click();

    cy.getLeftNav()
      .contains('Virtual Services')
      .click();
  });

  it('Create a Virtual Service', () => {
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
    cy.getIframeBody().contains('~ ^/uri-*regex?');
    cy.getIframeBody().contains('= exact-uri');
    cy.getIframeBody().contains('^= prefixed-uri (ignore case)');
    cy.getIframeBody().contains('TLS Route');
    cy.getIframeBody().contains('SNI Hosts');
    cy.getIframeBody().contains('TCP Route');
    cy.getIframeBody().contains('Destinations');
    cy.getIframeBody().contains('CORS Policy');
    cy.getIframeBody().contains('Redirect');
    cy.getIframeBody().contains('Delegate');
  });

  it('Inspect service list', () => {
    cy.getIframeBody()
      .contains('Virtual Services')
      .click();

    cy.getIframeBody().contains(SERVICE_NAME);
  });

  it('Delete Virtual Service', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', SERVICE_NAME)
      .find('[aria-label="Delete"]')
      .click();

    cy.getIframeBody()
      .contains('.fd-message-box button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', SERVICE_NAME)
      .should('not.exist');
  });
});
