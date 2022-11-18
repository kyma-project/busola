const SERVICE_NAME = `test-virtual-service-${Math.floor(Math.random() * 9999) +
  1000}`;
const MATCH_NAME = 'test-match';
const URI_KEY = 'prefix';
const URI_PREFIX = '/wpcatalog';

const HEADER_KEY = 'header';
const HEADER_KEY1 = 'exact';
const HEADER_VALUE = 'foo';

const REDIRECT_URI = '/v1/bookRatings';
const REDIRECT_AUTHORITY = 'newratings.default.svc.cluster.local';

// to edit
const GATEWAY =
  'kyma-gateway-application-connector.kyma-system.svc.cluster.local';
const HOST1 = 'host1.example.com';
const HOST2 = 'host2.example.com';

context('Test Virtual Services', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtension(
      'GATEWAYS',
      'examples/resources/istio/virtual-services.yaml',
    );

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Virtual Service', () => {
    cy.navigateTo('Istio', 'Virtual Services');

    cy.getIframeBody()
      .contains('Create Virtual Service')
      .click();

    // name
    cy.getIframeBody()
      .find('[arialabel="VirtualService name"]:visible', { log: false })
      .type(SERVICE_NAME);

    // HTTP
    cy.getIframeBody()
      .find('[aria-label="expand HTTP"]:visible', { log: false })
      .contains('Add')
      .click();

    // to remove after merge AP
    cy.getIframeBody()
      .find('[aria-label="expand HTTP"]:visible', { log: false })
      .eq(1)
      .click();

    // Matches
    cy.getIframeBody()
      .find('[aria-label="expand Matches"]:visible', { log: false })
      .contains('Add')
      .click();

    // to remove after merge AP
    cy.getIframeBody()
      .find('[aria-label="expand Match"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.http.0.match.0.name"]:visible')
      .type(MATCH_NAME);

    // URIs
    cy.getIframeBody()
      .find('[data-testid="select-dropdown"]:visible', { log: false })
      .first()
      .click();

    cy.getIframeBody()
      .contains(URI_KEY)
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type(URI_PREFIX);

    // Headers
    cy.getIframeBody()
      .find('[aria-label="expand Scheme"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Method"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Authority"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible', { log: false })
      .first()
      .filterWithNoValue()
      .type(HEADER_KEY);

    cy.getIframeBody()
      .find('[data-testid="select-dropdown"]:visible', { log: false })
      .first()
      .click();

    cy.getIframeBody()
      .contains(HEADER_KEY1)
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type(HEADER_VALUE);

    // REDIRECT
    cy.getIframeBody()
      .find('[aria-label="expand Redirect"]', { log: false })
      .first()
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.http.0.redirect.uri"]:visible')
      .type(REDIRECT_URI);

    cy.getIframeBody()
      .find('[data-testid="spec.http.0.redirect.authority"]:visible')
      .type(REDIRECT_AUTHORITY);

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

    cy.getIframeBody()
      .find('[data-testid="collapse-button-close"]', { timeout: 10000 })
      .click();

    cy.getIframeBody().contains(MATCH_NAME);
    cy.getIframeBody().contains(`${URI_KEY}=${URI_PREFIX}`);
    cy.getIframeBody().contains(HEADER_KEY);
    cy.getIframeBody().contains(HEADER_KEY1);
    cy.getIframeBody().contains(HEADER_VALUE);
    cy.getIframeBody().contains(REDIRECT_URI);
    cy.getIframeBody().contains(REDIRECT_AUTHORITY);
  });

  it('Edit VS and check updates', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    // Hosts
    cy.getIframeBody()
      .find('[aria-label="expand Hosts"]:visible', {
        log: false,
      })
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.hosts.0"]:visible')
      .clear()
      .type(HOST1);

    cy.getIframeBody()
      .find('[data-testid="spec.hosts.1"]:visible')
      .clear()
      .type(HOST2);

    // Gateways
    cy.getIframeBody()
      .find('[aria-label="expand Gateways"]:visible', {
        log: false,
      })
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.gateways.0"]:visible')
      .clear()
      .type(GATEWAY);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Update')
      .click();

    // Changed details
    cy.getIframeBody().contains(HOST1);
    cy.getIframeBody().contains(HOST2);
    cy.getIframeBody().contains(GATEWAY);
  });

  it('Inspect service list', () => {
    cy.inspectList('Virtual Services', SERVICE_NAME);
  });
});
