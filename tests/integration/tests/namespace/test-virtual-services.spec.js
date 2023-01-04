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

    cy.mockExtensions(['examples/resources/istio/virtual-services.yaml']);

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Virtual Service', () => {
    cy.navigateTo('Istio', 'Virtual Services');

    cy.contains('Create Virtual Service').click();

    // name
    cy.get('[arialabel="VirtualService name"]:visible', { log: false }).type(
      SERVICE_NAME,
    );

    // HTTP
    cy.get('[aria-label="expand HTTP"]:visible', { log: false })
      .contains('Add')
      .click();

    // Matches
    cy.get('[aria-label="expand Matches"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[data-testid="spec.http.0.match.0.name"]:visible').type(MATCH_NAME);

    // URIs
    cy.get('[data-testid="select-dropdown"]:visible', { log: false })
      .first()
      .click();

    cy.contains(URI_KEY).click();

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type(URI_PREFIX);

    // Headers
    cy.get('[aria-label="expand Scheme"]:visible', { log: false }).click();

    cy.get('[aria-label="expand Method"]:visible', { log: false }).click();

    cy.get('[aria-label="expand Authority"]:visible', { log: false }).click();

    cy.get('[placeholder="Enter key"]:visible', { log: false })
      .first()
      .filterWithNoValue()
      .type(HEADER_KEY);

    cy.get('[data-testid="select-dropdown"]:visible', { log: false })
      .first()
      .click();

    cy.contains(HEADER_KEY1).click();

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type(HEADER_VALUE);

    // REDIRECT
    cy.get('[aria-label="expand Redirect"]', { log: false })
      .first()
      .click();

    cy.get('[data-testid="spec.http.0.redirect.uri"]:visible').type(
      REDIRECT_URI,
    );

    cy.get('[data-testid="spec.http.0.redirect.authority"]:visible').type(
      REDIRECT_AUTHORITY,
    );

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.url().should('match', new RegExp(`/virtualservices/${SERVICE_NAME}$`));
  });

  it('Inspect Virtual Service', () => {
    cy.contains('h3', SERVICE_NAME);

    cy.get('[data-testid="collapse-button-close"]', { timeout: 10000 }).click();

    cy.contains(MATCH_NAME);
    cy.contains(`${URI_KEY}=${URI_PREFIX}`);
    cy.contains(HEADER_KEY);
    cy.contains(HEADER_KEY1);
    cy.contains(HEADER_VALUE);
    cy.contains(REDIRECT_URI);
    cy.contains(REDIRECT_AUTHORITY);
  });

  it('Edit VS and check updates', () => {
    cy.contains('Edit').click();

    // Hosts
    cy.get('[aria-label="expand Hosts"]:visible', {
      log: false,
    }).click();

    cy.get('[data-testid="spec.hosts.0"]:visible')
      .clear()
      .type(HOST1);

    cy.get('[data-testid="spec.hosts.1"]:visible')
      .clear()
      .type(HOST2);

    // Gateways
    cy.get('[aria-label="expand Gateways"]:visible', {
      log: false,
    }).click();

    cy.get('[data-testid="spec.gateways.0"]:visible')
      .clear()
      .type(GATEWAY);

    cy.get('[role="dialog"]')
      .contains('button', 'Update')
      .click();

    // Changed details
    cy.contains(HOST1);
    cy.contains(HOST2);
    cy.contains(GATEWAY);
  });

  it('Inspect service list', () => {
    cy.inspectList('Virtual Services', SERVICE_NAME);
  });
});
