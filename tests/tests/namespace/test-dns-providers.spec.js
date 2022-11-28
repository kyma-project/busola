/// <reference types="cypress" />
import 'cypress-file-upload';

const PROVIDER_NAME = 'test-provider';
const PROVIDER_TYPE = 'cloudflare-dns';
const PROVIDER_TYPE_PRETTY = 'Cloudflare DNS provider';
const PROVIDER_INCLUDED_DOMAIN = 'test.kyma.local';
const PROVIDER_INCLUDED_DOMAIN_2 = 'test2.kyma.local';
const PROVIDER_EXCLUDED_DOMAIN = 'sth.kyma.local';

context('Test DNS Providers', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create DNS Provider', () => {
    cy.navigateTo('Configuration', 'DNS Providers');

    cy.getIframeBody()
      .contains('Create DNS Provider')
      .click();

    // type
    cy.getIframeBody()
      .contains('Choose Provider type')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .contains(PROVIDER_TYPE_PRETTY)
      .scrollIntoView()
      .click();

    // secret
    cy.getIframeBody()
      .find('[placeholder^="Select name"]:visible', { log: false })
      .type('default');

    cy.getIframeBody()
      .contains(/default-token/)
      .click();

    // include domains
    cy.getIframeBody()
      .find('[placeholder="Domain that is allowed"]:visible', { log: false })
      .clear()
      .type(PROVIDER_INCLUDED_DOMAIN);

    // name
    cy.getIframeBody()
      .find('[ariaLabel="DNSProvider name"]:visible', { log: false })
      .clear()
      .type(PROVIDER_NAME);

    // create
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    // name
    cy.getIframeBody().contains(PROVIDER_NAME);
    // type
    cy.getIframeBody().contains(PROVIDER_TYPE);
    // included domain
    cy.getIframeBody().contains(PROVIDER_INCLUDED_DOMAIN);

    cy.wait(500);
    cy.getIframeBody()
      .contains(/unknown/)
      .should('not.exist');
  });

  it('Edit DNS Provider', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    // name should be readonly
    cy.getIframeBody()
      .find('[ariaLabel="DNSProvider name"]:visible', { log: false })
      .should('have.attr', 'readonly', 'readonly');

    // edit labels
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Labels')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('is-edited');

    cy.getIframeBody()
      .find('[role=dialog]')
      .find('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('yes');

    // edit excluded domains
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Include Domains')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Domain that is allowed"]')
      .filterWithNoValue()
      .type(PROVIDER_INCLUDED_DOMAIN_2);

    // edit excluded domains
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Exclude Domains')
      .scrollIntoView()
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Domain that is forbidden"]')
      .filterWithNoValue()
      .type(PROVIDER_EXCLUDED_DOMAIN);

    // hit update
    cy.getIframeBody()
      .contains('button', 'Update')
      .click();

    cy.getIframeBody().contains('Included Domains');

    // indluded domain
    cy.getIframeBody().contains(PROVIDER_INCLUDED_DOMAIN_2);
    // excluded domain
    cy.getIframeBody().contains(PROVIDER_EXCLUDED_DOMAIN);
  });

  it('Inspect list', () => {
    cy.inspectList('DNS Providers', PROVIDER_NAME);

    // label
    cy.getIframeBody().contains('is-edited=yes');
    // type
    cy.getIframeBody().contains(PROVIDER_TYPE);
  });
});
