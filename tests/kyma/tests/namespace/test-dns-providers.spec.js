/// <reference types="cypress" />
import 'cypress-file-upload';
import { chooseComboboxOption } from '../../support/helpers';

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

    cy.openCreate();

    // type
    chooseComboboxOption(
      '[placeholder="Choose Provider type"]',
      PROVIDER_TYPE_PRETTY,
    );

    // secret
    chooseComboboxOption(
      '[placeholder="Select Namespace"]',
      Cypress.env('NAMESPACE_NAME'),
    );

    cy.wait(500);

    chooseComboboxOption(
      '[placeholder="Select name"]',
      'serverless-registry-config-default',
    );

    // include domains
    cy.get('[placeholder="Domain that is allowed"]:visible', { log: false })
      .find('input')
      .clear()
      .type(PROVIDER_INCLUDED_DOMAIN, { force: true });

    // name
    cy.get('[aria-label="DNSProvider name"]:visible')
      .find('input')
      .type(PROVIDER_NAME, { force: true });

    // create
    cy.saveChanges('Create');
  });

  it('Inspect details', () => {
    // name
    cy.getMidColumn().contains(PROVIDER_NAME);
    // type
    cy.getMidColumn().contains(PROVIDER_TYPE);
    // included domain
    cy.getMidColumn().contains(PROVIDER_INCLUDED_DOMAIN);
  });

  it('Edit DNS Provider', () => {
    cy.inspectTab('Edit');

    // name should be readonly
    cy.get('[aria-label="DNSProvider name"]:visible')
      .find('input')
      .should('have.attr', 'readonly', 'readonly');

    // edit labels
    cy.get('[aria-label="expand Labels"]')
      .filter(':visible', { log: false })
      .click();

    cy.get('[placeholder="Enter key"]:visible', { log: false })
      .find('input')
      .filterWithNoValue()
      .type('is-edited', { force: true });

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .find('input')
      .filterWithNoValue()
      .first()
      .type('yes', { force: true });

    cy.get('[placeholder="Domain that is allowed"]')
      .find('input')
      .filterWithNoValue()
      .type(PROVIDER_INCLUDED_DOMAIN_2);

    // edit excluded domains
    cy.contains('Exclude Domains')
      .scrollIntoView()
      .filter(':visible', { log: false })
      .click();

    cy.get('[placeholder="Domain that is forbidden"]')
      .find('input')
      .filterWithNoValue()
      .type(PROVIDER_EXCLUDED_DOMAIN);

    // hit update
    cy.saveChanges('Edit');
    cy.getMidColumn().inspectTab('View');

    cy.getMidColumn().contains('Included Domains');

    // indluded domain
    cy.getMidColumn().contains(PROVIDER_INCLUDED_DOMAIN_2);
    // excluded domain
    cy.getMidColumn().contains(PROVIDER_EXCLUDED_DOMAIN);
  });

  it('Inspect list', () => {
    cy.inspectList(PROVIDER_NAME);

    // type
    cy.contains(PROVIDER_TYPE);
  });
});
