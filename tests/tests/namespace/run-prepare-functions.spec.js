/// <reference types="cypress" />
import 'cypress-file-upload';

const FUNCTION_NAME = 'test-function';
const FUNCTION_RECEIVER_NAME = 'in-cluster-eventing-receiver';
const API_RULE_AND_FUNCTION_NAME = 'in-cluster-eventing-publisher';

context('Prepare funtions for testing', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a simple Function', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.createSimpleFunction(FUNCTION_NAME);
  });

  it('Edit a receiver Function and check updated Resources', () => {
    cy.getIframeBody()
      .contains('button', 'Edit')
      .click();

    cy.getIframeBody()
      .find('[aria-haspopup="listbox"]:visible')
      .first()
      .click();

    cy.getIframeBody()
      .contains('Node.js 16')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();

    cy.getIframeBody()
      .contains('Node.js 16')
      .should('be.visible');
  });

  it('Create a receiver Function', () => {
    cy.createFunction(
      FUNCTION_RECEIVER_NAME,
      'fixtures/in-cluster-eventing-receiver.js',
      'fixtures/in-cluster-eventing-receiver-dependencies.json',
    );
  });

  it('Create a publisher Function', () => {
    cy.createFunction(
      API_RULE_AND_FUNCTION_NAME,
      'fixtures/in-cluster-eventing-publisher.js',
      'fixtures/in-cluster-eventing-publisher-dependencies.json',
    );
  });
});
