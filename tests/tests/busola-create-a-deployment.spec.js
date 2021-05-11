/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const random = Math.floor(Math.random() * 1000);
const NAMESPACE_NAME = `b-busola-test-${random}`;

const DOCKER_IMAGE = 'eu.gcr.io/kyma-project/pr/orders-service:PR-162';
const DEPLOYMENT_NAME = 'orders-service';

context('Busola - Create a Deployment', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

  before(() => {
    cy.visit(ADDRESS)
      .getIframeBody()
      .contains('Add Cluster')
      .click();

    cy.getIframeBody()
      .contains('Drag file here')
      .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

    cy.getIframeBody()
      .find('[role=alert]')
      .should('not.exist');
    cy.url().should('match', /namespaces$/);
    cy.getIframeBody()
      .find('thead')
      .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.
  });

  after(() => {
    getLeftNav()
      .contains('Namespaces') //it finds Namespaces (expected) or Back to Namespaces (if tests fail in the middle)
      .click({ force: true }); //we need to use force when others elements make menu not visible

    cy.getIframeBody()
      .find('[aria-label="open-search"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Search"]')
      .type(NAMESPACE_NAME);

    cy.getIframeBody()
      .find('[aria-label="Delete"]')
      .click();

    cy.getIframeBody()
      .find('[role="status"]')
      .should('have.text', 'TERMINATING');
  });

  it('Create a new namespace', () => {
    getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('Create Namespace')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find("input[placeholder='Namespace name']")
      .should('be.visible')
      .type(NAMESPACE_NAME);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Go to the details of namespace', () => {
    cy.getIframeBody()
      .contains('a', NAMESPACE_NAME)
      .click();
  });

  it('Create a Deployment', () => {
    cy.getIframeBody()
      .contains('Deploy new workload')
      .click();

    cy.getIframeBody()
      .find('[role="menuitem"]')
      .contains('Create Deployment')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Deployment name"]')
      .clear()
      .type(DEPLOYMENT_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`app=${DEPLOYMENT_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`example=${DEPLOYMENT_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Docker image"]')
      .type(DOCKER_IMAGE);

    cy.getIframeBody()
      .contains('label', 'Memory requests')
      .next('input')
      .clear()
      .type('16Mi');

    cy.getIframeBody()
      .contains('label', 'Memory limits')
      .next('input')
      .clear()
      .type('32Mi');

    cy.getIframeBody()
      .contains('label', 'CPU requests')
      .next('input')
      .clear()
      .type('10m');

    cy.getIframeBody()
      .contains('label', 'CPU limits')
      .next('input')
      .clear()
      .type('20m');

    cy.getIframeBody()
      .contains('button', 'Create')
      .click({ force: true });
  });

  it('Check if deployment and service exist', () => {
    cy.getIframeBody()
      .contains('a', DEPLOYMENT_NAME)
      .should('be.visible');

    getLeftNav()
      .contains('Discovery and Network')
      .click();

    getLeftNav()
      .find('[data-testid=services_services]')
      .click()
      .wait(1000);

    cy.getIframeBody()
      .find('a')
      .contains(DEPLOYMENT_NAME)
      .should('be.visible');
  });
});
