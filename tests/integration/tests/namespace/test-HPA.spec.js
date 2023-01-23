/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const HPA_NAME = 'test-hpa';
const DOCKER_IMAGE = 'nginx';
const DEPLOYEMENT_NAME = 'no-pod';

async function loadHPA(namespaceName) {
  const HPA = await loadFile('test-HPA.yaml');

  HPA.metadata.namespace = namespaceName;

  return HPA;
}

context('Test HPA', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Creates auxiliary Deployment', () => {
    cy.navigateTo('Workloads', 'Deployments');

    cy.contains('button', 'Create Deployment').click();

    cy.get('.fd-dialog__content')
      .find('[ariaLabel^="Deployment name"]:visible')
      .type(DEPLOYEMENT_NAME);

    cy.get('.fd-dialog__content')
      .find('[placeholder^="Enter the Docker image"]:visible')
      .type(DOCKER_IMAGE);

    cy.get('.fd-dialog__content')
      .contains('button', 'Create')
      .click();

    cy.contains('h3', DEPLOYEMENT_NAME).should('be.visible');
  });

  it('Create HPA', () => {
    cy.navigateTo('Discovery and Network', 'Horizontal Pod');

    cy.contains('Create Horizontal Pod Autoscaler').click();

    cy.wrap(loadHPA(Cypress.env('NAMESPACE_NAME'))).then(HPA_CONFIG => {
      const HPA = JSON.stringify(HPA_CONFIG);
      cy.pasteToMonaco(HPA);
    });

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.contains('[aria-label="title"]', HPA_NAME).should('be.visible');
  });

  it('Check HPA details', () => {
    cy.get('[data-testid=hpa-spec-ref]')
      .contains(`Deployment (${DEPLOYEMENT_NAME})`)
      .should('be.visible');

    cy.contains('#content-wrap', 'Events').should('be.visible');
  });

  it('Check HPA list', () => {
    cy.inspectList('Horizontal Pod', HPA_NAME);
  });

  it('Check HPA subcomponent', () => {
    cy.get('[role=row]')
      .contains(HPA_NAME)
      .click();

    cy.get('[data-testid=hpa-spec-ref]')
      .contains(DEPLOYEMENT_NAME)
      .click();

    cy.url().should('match', /deployments/);

    cy.contains(HPA_NAME).should('be.visible');
  });
});
