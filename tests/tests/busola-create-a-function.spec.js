/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const NAMESPACE_NAME = config.namespace;

context('Busola - Create a Function', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

  it('Create a new namespace', () => {
    cy.wait(3000);
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
    cy.wait(1000);
    cy.getIframeBody()
      .contains('a', NAMESPACE_NAME)
      .click();
  });

  it('Create a Function', () => {
    getLeftNav()
      .contains('Workloads')
      .click();

    getLeftNav()
      .contains('Functions')
      .click();

    cy.getIframeBody()
      .contains('Create Function')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Function name"]')
      .clear()
      .type('orders-function');

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type('app=orders-function');

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type('example=orders-function');

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.wait(3000);
    cy.readFile('fixtures/orders-function.js').then(body => {
      cy.getIframeBody()
        .find('textarea[aria-roledescription="editor"]')
        .filter(':visible')
        .clear()
        .paste({
          pastePayload: body,
        });
    });

    cy.getIframeBody()
      .find('[aria-controls="function-dependencies"]')
      .click();

    cy.readFile('fixtures/orders-function-dependencies.json').then(body => {
      cy.getIframeBody()
        .find('textarea[aria-roledescription="editor"]')
        .filter(':visible')
        .clear()
        .paste({
          pastePayload: JSON.stringify(body),
        });
    });

    cy.wait(1000);
    cy.getIframeBody()
      .find('.lambda-details')
      .contains('button', 'Save')
      .click();
  });
});
