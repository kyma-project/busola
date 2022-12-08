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
    cy.wait(500); // TODO
    cy.navigateTo('Configuration', 'Dns Providers');

    cy.contains('Create DNS Provider').click();

    // type
    cy.contains('Choose Provider type')
      .filter(':visible', { log: false })
      .click();

    cy.contains(PROVIDER_TYPE_PRETTY)
      .scrollIntoView()
      .click();

    // secret
    cy.get('[placeholder^="Select name"]:visible', { log: false }).type(
      'default',
    );

    cy.contains(/default-token/).click();

    // include domains
    cy.get('[placeholder="Domain that is allowed"]:visible', { log: false })
      .clear()
      .type(PROVIDER_INCLUDED_DOMAIN);

    // name
    cy.get('[ariaLabel="DNSProvider name"]:visible', { log: false })
      .clear()
      .type(PROVIDER_NAME);

    // create
    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    // name
    cy.contains(PROVIDER_NAME);
    // type
    cy.contains(PROVIDER_TYPE);
    // included domain
    cy.contains(PROVIDER_INCLUDED_DOMAIN);

    cy.get('[role=status]').should('have.text', 'Error');
  });

  it('Edit DNS Provider', () => {
    cy.contains('Edit').click();

    // name should be readonly
    cy.get('[ariaLabel="DNSProvider name"]:visible', { log: false }).should(
      'have.attr',
      'readonly',
      'readonly',
    );

    // edit labels
    cy.get('[role=dialog]')
      .contains('Labels')
      .filter(':visible', { log: false })
      .click();

    cy.get('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('is-edited');

    cy.get('[role=dialog]')
      .find('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('yes');

    // edit excluded domains
    cy.get('[role=dialog]')
      .contains('Include Domains')
      .filter(':visible', { log: false })
      .click();

    cy.get('[placeholder="Domain that is allowed"]')
      .filterWithNoValue()
      .type(PROVIDER_INCLUDED_DOMAIN_2);

    // edit excluded domains
    cy.get('[role=dialog]')
      .contains('Exclude Domains')
      .scrollIntoView()
      .filter(':visible', { log: false })
      .click();

    cy.get('[placeholder="Domain that is forbidden"]')
      .filterWithNoValue()
      .type(PROVIDER_EXCLUDED_DOMAIN);

    // hit update
    cy.contains('button', 'Update').click();

    cy.contains('Included Domains');

    // indluded domain
    cy.contains(PROVIDER_INCLUDED_DOMAIN_2);
    // excluded domain
    cy.contains(PROVIDER_EXCLUDED_DOMAIN);
  });

  it('Inspect list', () => {
    cy.inspectList('DNS Providers', PROVIDER_NAME);

    // label
    cy.contains('is-edited=yes');
    // type
    cy.contains(PROVIDER_TYPE);
  });
});
