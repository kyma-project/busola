/// <reference types="cypress" />
import 'cypress-file-upload';

const DOCKER_IMAGE = 'eu.gcr.io/kyma-project/pr/orders-service:PR-162';
const CONFIG_MAP_NAME = 'test-configmap';
const SECRET_NAME = 'test-secret';

context('Busola - Testing Configuration', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');
  it('Test a Config Map', () => {
    getLeftNav()
      .contains('Configuration')
      .click();

    getLeftNav()
      .find('[data-testid=config-maps_configmaps]')
      .click()
      .wait(1000);

    cy.getIframeBody()
      .contains('Create Config Map')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Config Map name"]')
      .clear()
      .type(CONFIG_MAP_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`app=${CONFIG_MAP_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
    cy.wait(1000);

    cy.getIframeBody()
      .contains('a', CONFIG_MAP_NAME)
      .click({ force: true });
  });

  it('Test a Secret', () => {
    getLeftNav()
      .find('[data-testid=secrets_secrets]')
      .click()
      .wait(1000);

    cy.getIframeBody()
      .contains('Create Secret')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Secret name"]')
      .clear()
      .type(SECRET_NAME);

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type(`app=${SECRET_NAME}`);

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
    cy.wait(1000);

    cy.getIframeBody()
      .contains('a', SECRET_NAME)
      .click({ force: true });
  });
});
