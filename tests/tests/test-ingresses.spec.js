/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';

const RANDOM_NUMBER = Math.random()
  .toString()
  .substr(2, 8);

const NAME = 'test-' + RANDOM_NUMBER;
async function loadIngress(name, namespace) {
  const Ingress = await loadFile('test-ingress.yaml');
  const newIngress = { ...Ingress };
  newIngress.metadata.name = name;
  newIngress.metadata.namespace = namespace;
  newIngress.spec.rules[0].host = `${RANDOM_NUMBER}${newIngress.spec.rules[0].host}`;
  newIngress.spec.rules[0].http.paths[0].path = `${newIngress.spec.rules[0].http.paths[0].path}${RANDOM_NUMBER}`;
  newIngress.spec.rules[0].http.paths[1].path = `${newIngress.spec.rules[0].http.paths[1].path}${RANDOM_NUMBER}`;

  return newIngress;
}

context('Test Ingresses', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create an Ingress', () => {
    cy.navigateTo('Discovery and Network', 'Ingress');

    cy.getIframeBody()
      .contains('Create Ingress')
      .click();

    cy.wrap(loadIngress(NAME, Cypress.env('NAMESPACE_NAME'))).then(
      INGRESS_CONFIG => {
        const INGRESS = JSON.stringify(INGRESS_CONFIG);
        cy.pasteToMonaco(INGRESS);
      },
    );

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check Ingress details', () => {
    cy.getIframeBody()
      .contains(NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/rules/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/default backend/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/paths/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains(/web:8080/i)
      .should('be.visible');
  });

  it('Check Ingresses list', () => {
    cy.getLeftNav()
      .find('[data-testid=ingresses_ingresses]')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(NAME, { force: true });

    cy.getIframeBody()
      .contains('tbody tr td a', NAME)
      .click({ force: true });
  });
});
