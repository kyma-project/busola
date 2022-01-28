/// <reference types="cypress" />
import 'cypress-file-upload';

const FUNCTION_NAME = 'test-function';
const FUNCTION_RECEIVER_NAME = 'in-cluster-eventing-receiver';
const API_RULE_AND_FUNCTION_NAME = 'in-cluster-eventing-publisher';

context('API Rules in the Function details view', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a simple Function', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.createSimpleFunction(FUNCTION_NAME, true);
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
