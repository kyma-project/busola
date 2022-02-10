/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';

const CRD_PLURAL_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const CRD_NAME = CRD_PLURAL_NAME + `.${CRD_PLURAL_NAME}.example.com`;

async function loadCRD(crdPluralName, crdName) {
  const CRD = await loadFile('test-customresourcedefinisions.yaml');
  const newCRD = { ...CRD };

  newCRD.spec.group = `${crdPluralName}.example.com`;
  newCRD.metadata.name = crdName;
  newCRD.spec.names.plural = crdPluralName;

  return newCRD;
}

async function loadCRInstance(crdPluralName) {
  const CR = await loadFile('test-custom-resource-instance.yaml');

  const newCR = { ...CR };
  newCR.metadata.namespace = Cypress.env('NAMESPACE_NAME');
  newCR.apiVersion = `${crdPluralName}.example.com/v1`;
  return newCR;
}

context('Test Custom Resource Definitions', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Custom Resource Definition', () => {
    cy.navigateTo('Configuration', 'Custom Resource Definitions');

    cy.getIframeBody()
      .contains('Create Custom Resource Definition')
      .click();

    cy.wrap(loadCRD(CRD_PLURAL_NAME, CRD_NAME)).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);

      cy.pasteToMonaco(CRD);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check Custom Resource Definitions list', () => {
    cy.getLeftNav()
      .find('[data-testid=customresourcedefinitions_customresourcedefinitions]')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(CRD_NAME, { force: true });

    cy.getIframeBody().contains('Namespaced');

    cy.getIframeBody()
      .contains('tbody tr td a', CRD_NAME)
      .click({ force: true });
  });

  it('Check Custom Resource Definition details', () => {
    cy.getIframeBody()
      .contains(/served/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/storage/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/crontab/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/test/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/namespaced/i)
      .should('be.visible');
  });

  it('Create Custom Resource', () => {
    cy.getIframeBody()
      .contains('button', 'Create CronTab')
      .click();

    cy.wrap(loadCRInstance(CRD_PLURAL_NAME)).then(CR_CONFIG => {
      cy.log('CONFIG', CR_CONFIG);
      const CR = JSON.stringify(CR_CONFIG);
      cy.log('CR', CR);
      cy.pasteToMonaco(CR);
      cy.wait(40000);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Delete Custom Resource Definition', () => {
    cy.getIframeBody()
      .contains('h3', 'my-cron-tab')
      .should('be.visible');

    cy.getIframeBody()
      .contains('a', CRD_NAME)
      .click();

    cy.deleteInDetails();
  });
});
