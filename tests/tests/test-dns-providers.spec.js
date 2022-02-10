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
      .contains('Choose Provider Type')
      .filter(':visible', { log: false })
      .click();
    cy.getIframeBody()
      .contains(PROVIDER_TYPE_PRETTY)
      .click();

    // secret
    cy.getIframeBody()
      .find('[placeholder^="Select name"]')
      .filter(':visible', { log: false })
      .type('default');
    cy.getIframeBody()
      .contains(/default-token/)
      .click();

    // include domains
    cy.getIframeBody()
      .find('[placeholder="Domain that is allowed"]')
      .filter(':visible', { log: false })
      .clear()
      .type(PROVIDER_INCLUDED_DOMAIN);

    // name
    cy.getIframeBody()
      .find('[placeholder="DNS Provider Name"]')
      .filter(':visible', { log: false })
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
    // indluded domain
    cy.getIframeBody().contains(PROVIDER_INCLUDED_DOMAIN);
  });

  it('Edit DNS Provider', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    // name should be readonly
    cy.getIframeBody()
      .find('[placeholder="DNS Provider Name"]')
      .filter(':visible', { log: false })
      .should('have.attr', 'readonly', 'readonly');

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    // edit labels
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Labels')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]')
      .filterWithNoValue()
      .type('is-edited');

    cy.getIframeBody()
      .find('[role=dialog]')
      .find('[placeholder="Enter Value"]')
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
    cy.getLeftNav()
      .contains('DNS Providers')
      .click();

    // name
    cy.getIframeBody().contains(PROVIDER_NAME);
    // label
    cy.getIframeBody().contains('is-edited=yes');
    // type
    cy.getIframeBody().contains(PROVIDER_TYPE);
  });
});
