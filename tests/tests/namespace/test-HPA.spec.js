/// <reference types="cypress" />
import 'cypress-file-upload';
import { deleteFromGenericList } from '../../support/helpers';
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

    cy.getIframeBody()
      .contains('button', 'Create Deployment')
      .click();

    cy.getIframeBody()
      .find('.fd-dialog__content')
      .find('[ariaLabel^="Deployment name"]:visible')
      .type(DEPLOYEMENT_NAME);

    cy.getIframeBody()
      .find('.fd-dialog__content')
      .find('[placeholder^="Enter the Docker image"]:visible')
      .type(DOCKER_IMAGE);

    cy.getIframeBody()
      .find('.fd-dialog__content')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', DEPLOYEMENT_NAME)
      .should('be.visible');
  });

  it('Create HPA', () => {
    cy.navigateTo('Discovery and Network', 'Horizontal Pod');

    cy.getIframeBody()
      .contains('Create Horizontal Pod Autoscaler')
      .click();

    cy.wrap(loadHPA(Cypress.env('NAMESPACE_NAME'))).then(HPA_CONFIG => {
      const HPA = JSON.stringify(HPA_CONFIG);
      cy.pasteToMonaco(HPA);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', HPA_NAME)
      .should('be.visible');
  });

  it('Check HPA details', () => {
    cy.getIframeBody()
      .find('[data-testid=hpa-spec-ref]')
      .contains('apps/v1/deployments')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Events')
      .should('be.visible');
  });

  it('Check HPA list', () => {
    cy.inspectList('Horizontal Pod', HPA_NAME);
  });

  it('Check HPA subcomponent', () => {
    cy.navigateTo('Workloads', 'Deployments');

    cy.getIframeBody()
      .contains(DEPLOYEMENT_NAME)
      .click();

    cy.getIframeBody()
      .contains(HPA_NAME)
      .should('be.visible');
  });

  it('Delete HPA ', () => {
    cy.navigateTo('Discovery and Network', 'Horizontal Pod');

    deleteFromGenericList(HPA_NAME);
  });
});
