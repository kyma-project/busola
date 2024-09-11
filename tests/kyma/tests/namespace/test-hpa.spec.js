/// <reference types="cypress" />
import 'cypress-file-upload';
import { chooseComboboxOption } from '../../support/helpers';

const HPA_NAME = 'test-hpa';
const DOCKER_IMAGE = 'nginx';
const DEPLOYEMENT_NAME = 'no-pod';
const MIN_REPLICAS = 2;
const MAX_REPLICAS = 3;
const SCALE_TARGET_REF_KIND = 'Deployment';
const SCALE_TARGET_REF_NAME = 'no-pod';

context('Test HPA', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Creates auxiliary Deployment', () => {
    cy.navigateTo('Workloads', 'Deployments');

    cy.openCreate();

    cy.get('[aria-label="Deployment name"]:visible')
      .find('input')
      .type(DEPLOYEMENT_NAME, { force: true });

    cy.get('[placeholder^="Enter the Docker image"]:visible')
      .find('input')
      .type(DOCKER_IMAGE, { force: true });

    cy.saveChanges('Create');

    cy.contains('ui5-title', DEPLOYEMENT_NAME).should('be.visible');
  });

  it('Create HPA', () => {
    cy.navigateTo('Discovery and Network', 'Horizontal Pod');

    cy.openCreate();

    cy.get('[aria-label="HorizontalPodAutoscaler name"]:visible')
      .find('input')
      .type(HPA_NAME, { force: true });

    cy.get('[data-testid="spec.maxReplicas"]:visible')
      .find('input')
      .click()
      .clear()
      .type(MAX_REPLICAS, { force: true });

    chooseComboboxOption(
      '[data-testid="spec.scaleTargetRef.kind"]',
      SCALE_TARGET_REF_KIND,
    );

    cy.wait(500);

    cy.get('[data-testid="spec.scaleTargetRef.name"]:visible')
      .find('input')
      .type(SCALE_TARGET_REF_NAME, { force: true });

    cy.saveChanges('Create');

    cy.getMidColumn()
      .contains('ui5-title', HPA_NAME)
      .should('be.visible');
  });

  it('Check HPA details', () => {
    cy.getMidColumn()
      .contains('Deployment')
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-link', DEPLOYEMENT_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('Events')
      .should('be.visible');
  });

  it('Check HPA list', () => {
    cy.wait(500);
    cy.inspectList(HPA_NAME);
  });

  it('Check HPA subcomponent', () => {
    cy.clickGenericListLink(HPA_NAME);

    cy.contains('ui5-link', DEPLOYEMENT_NAME).click();

    cy.url().should('match', /deployments/);
  });

  it('Check Edit HPA', () => {
    cy.clickGenericListLink(HPA_NAME);

    cy.inspectTab('Edit');

    cy.getMidColumn()
      .get('[data-testid="spec.minReplicas"]:visible')
      .find('input')
      .click()
      .clear()
      .type(MIN_REPLICAS, { force: true });

    cy.saveChanges('Edit');
    cy.inspectTab('View');

    cy.contains('Min Replicas')
      .parent()
      .contains(MIN_REPLICAS);
  });
});
